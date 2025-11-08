import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import requests
import threading
import subprocess
import os
from urllib.parse import urlparse

# --- Configurations --- #
API_BASE_URL = "https://the-loom-pqy4.onrender.com/api"
DOWNLOAD_DIR = "worker_jobs"


# --- Logic Functions --- #


def finish_job(id):
    response = requests.put(f"{API_BASE_URL}/projects/{id}",
                            json={
                                'status': 'COMPLETED',
                                'progress': 100,
                                }
                            )

def fetch_job_data(slug, ui_elements):
    """Fetches and claims a job slug in a separate thread."""
    log_area = ui_elements["log_area"]
    log_area.log(f"Claiming job with temporary slug: {slug}")
    
    try:
        response = requests.get(f"{API_BASE_URL}/jobs/claim/{slug}")
        response.raise_for_status()
        
        data = response.json()
        if data.get("success"):
            log_area.log("Job claimed and data received successfully!")
            ui_elements["root"].after(0, update_ui_with_job_data, data["project"], ui_elements)
        else:
            error_message = data.get('error', 'Unknown error while claiming the slug.')
            log_area.log(f"Error: {error_message}", "error")
            messagebox.showerror("Error", error_message)

    except requests.exceptions.RequestException as e:
        if e.response is not None and e.response.status_code == 404:
            log_area.log("Error: Invalid or expired slug.", "error")
            messagebox.showerror("Error 404", "Invalid or expired slug. Request a new one.")
        else:
            log_area.log(f"Connection error: {e}", "error")
            messagebox.showerror("Connection Error", f"Unable to connect to the API. Make sure the server is running.\n\n{e}")
    except Exception as e:
        log_area.log(f"Unexpected error: {e}", "error")
        messagebox.showerror("Unexpected Error", str(e))


def update_ui_with_job_data(project_data, ui_elements):
    """Updates the UI with received project data."""
    ui_elements["job_info"]["title"].config(text=project_data.get("title", "N/A"))
    ui_elements["job_info"]["type"].config(text=project_data.get("type", "N/A"))
    ui_elements["job_info"]["price"].config(text=f'{project_data.get("price", 0):.2f} $')
    ui_elements["job_info"]["dataset_link"].config(text=project_data.get("cloud_link", "None"))
    ui_elements["job_info"]["script_path"].config(text=project_data.get("script_path", "None"))

    # Store project ID and enable button
    ui_elements["start_button"].config(state=tk.NORMAL)
    ui_elements["start_button"].project_id = project_data.get("id")
    ui_elements["start_button"].project_data = project_data


def start_job_execution(project_id, project_data, ui_elements):
    """Starts the job execution in a separate thread."""
    log_area = ui_elements["log_area"]
    log_area.clear()
    log_area.log(f"Starting job for project ID: {project_id}")
    ui_elements["start_button"].config(state=tk.DISABLED)
    ui_elements["fetch_button"].config(state=tk.DISABLED)

    try:
        # 1. Update status to WORKING
        log_area.log("Updating status to: WORKING")
        update_status(project_id, "WORKING", log_area)

        # 2. Create directory and download files
        job_dir = os.path.join(DOWNLOAD_DIR, str(project_id))
        os.makedirs(job_dir, exist_ok=True)
        log_area.log(f"Working directory created at: {job_dir}")

        script_url = f"http://localhost:3000{project_data['script_path']}"
        dataset_url = project_data.get('cloud_link')

        local_script_path = download_file(script_url, job_dir, log_area)
        if dataset_url:
            download_file(dataset_url, job_dir, log_area)

        # 3. Execute the script using subprocess
        log_area.log(f"Running script: python3 {local_script_path}", "cmd")
        execute_script(local_script_path, job_dir, log_area)

        # 4. Update status to COMPLETED
        log_area.log("Job completed successfully!", "success")
        update_status(project_id, "COMPLETED", log_area)
        messagebox.showinfo("Success", "The job has completed successfully!")


        finish_job(project_id)

    except Exception as e:
        log_area.log(f"Job execution failed: {e}", "error")
        update_status(project_id, "FAILED", log_area)
        messagebox.showerror("Job Error", f"An error occurred: {e}")

    finally:
        ui_elements["start_button"].config(state=tk.NORMAL)
        ui_elements["fetch_button"].config(state=tk.NORMAL)


def update_status(project_id, status, log_area):
    """Updates the project status via API PUT."""
    try:
        response = requests.put(f"{API_BASE_URL}/projects/{project_id}", json={"status": status})
        response.raise_for_status()
        log_area.log(f"Status updated to: {status}")
    except requests.exceptions.RequestException as e:
        log_area.log(f"Error updating status: {e}", "error")
        raise Exception(f"Unable to update status to {status}")


def download_file(url, dest_folder, log_area):
    """Downloads a file from a URL to a local folder."""
    if not url:
        log_area.log("Download URL not provided. Skipping.", "warning")
        return None
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        filename = os.path.basename(urlparse(url).path)
        local_path = os.path.join(dest_folder, filename)
        
        log_area.log(f"Downloading {filename} to {local_path}...")
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        log_area.log(f"{filename} downloaded successfully.")
        return local_path
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to download file {url}. Error: {e}")


def execute_script(script_path, work_dir, log_area):
    """Executes a script and streams its output to the log area."""
    process = subprocess.Popen(
        ["python3", script_path],
        cwd=work_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        universal_newlines=True
    )

    for line in iter(process.stdout.readline, ''):
        log_area.log(line.strip(), "stdout")
    
    stderr_output = process.stderr.read()
    if stderr_output:
        log_area.log(stderr_output.strip(), "stderr")

    process.stdout.close()
    process.wait()

    if process.returncode != 0:
        raise Exception(f"The script failed with exit code {process.returncode}")


# --- UI Classes --- #

class LogArea(scrolledtext.ScrolledText):
    """Custom text area for logs with colored output."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.config(state=tk.DISABLED, bg="black", fg="white", font=("monospace", 9))
        
        self.tag_config("info", foreground="white")
        self.tag_config("error", foreground="#FF6B6B")
        self.tag_config("success", foreground="#6BCB77")
        self.tag_config("warning", foreground="#FFD93D")
        self.tag_config("cmd", foreground="#4D96FF")
        self.tag_config("stdout", foreground="#C8C8C8")
        self.tag_config("stderr", foreground="#FF8C8C")

    def log(self, message, level="info"):
        self.config(state=tk.NORMAL)
        self.insert(tk.END, f"> {message}\n", level)
        self.see(tk.END)
        self.config(state=tk.DISABLED)
    
    def clear(self):
        self.config(state=tk.NORMAL)
        self.delete(1.0, tk.END)
        self.config(state=tk.DISABLED)


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("The Loom - Worker Node")
        self.geometry("700x650")

        self.ui_elements = {}
        self.ui_elements["root"] = self

        self.create_widgets()

    def create_widgets(self):
        main_frame = ttk.Frame(self, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # --- Fetch Section ---
        fetch_frame = ttk.Frame(main_frame)
        fetch_frame.pack(fill=tk.X, pady=5)

        ttk.Label(fetch_frame, text="Job Slug:").pack(side=tk.LEFT, padx=(0, 5))
        slug_entry = ttk.Entry(fetch_frame, width=40)
        slug_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.ui_elements["slug_entry"] = slug_entry

        fetch_button = ttk.Button(fetch_frame, text="Fetch Job", command=self.on_fetch_click)
        fetch_button.pack(side=tk.LEFT, padx=(5, 0))
        self.ui_elements["fetch_button"] = fetch_button

        # --- Job Info Section ---
        job_info_frame = ttk.LabelFrame(main_frame, text="Job Information", padding="10")
        job_info_frame.pack(fill=tk.X, pady=10)
        self.ui_elements["job_info"] = {}

        info_labels = {
            "title": "Title:", "type": "Type:", "price": "Price:",
            "dataset_link": "Dataset Link:", "script_path": "Script Path:"
        }
        for i, (key, text) in enumerate(info_labels.items()):
            ttk.Label(job_info_frame, text=text, font=("Helvetica", 10, "bold")).grid(row=i, column=0, sticky=tk.W, pady=2)
            value_label = ttk.Label(job_info_frame, text="-", wraplength=450, justify=tk.LEFT)
            value_label.grid(row=i, column=1, sticky=tk.W, padx=5)
            self.ui_elements["job_info"][key] = value_label

        # --- Action Button ---
        start_button = ttk.Button(main_frame, text="Start Job", state=tk.DISABLED, command=self.on_start_click)
        start_button.pack(fill=tk.X, pady=5)
        self.ui_elements["start_button"] = start_button

        # --- Log Area ---
        log_frame = ttk.LabelFrame(main_frame, text="Execution Log", padding="5")
        log_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        log_area = LogArea(log_frame, wrap=tk.WORD)
        log_area.pack(fill=tk.BOTH, expand=True)
        self.ui_elements["log_area"] = log_area

    def on_fetch_click(self):
        slug = self.ui_elements["slug_entry"].get()
        if not slug:
            messagebox.showwarning("Invalid Input", "Please enter a slug.")
            return
        thread = threading.Thread(target=fetch_job_data, args=(slug, self.ui_elements))
        thread.daemon = True
        thread.start()

    def on_start_click(self):
        project_id = getattr(self.ui_elements["start_button"], "project_id", None)
        project_data = getattr(self.ui_elements["start_button"], "project_data", None)
        if not project_id or not project_data:
            messagebox.showerror("Error", "Project data not loaded. Please fetch the job first.")
            return
        
        thread = threading.Thread(target=start_job_execution, args=(project_id, project_data, self.ui_elements))
        thread.daemon = True
        thread.start()


# --- Entry Point --- #
if __name__ == "__main__":
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR)
    
    app = App()
    app.mainloop()

