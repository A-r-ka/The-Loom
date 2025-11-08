
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import requests
import threading
import subprocess
import os
import json
from urllib.parse import urlparse

# --- Configurações --- #
API_BASE_URL = "https://loom-backend-api.onrender.com"
DOWNLOAD_DIR = "worker_jobs"

# --- Funções de Lógica --- #

def fetch_job_data(slug, ui_elements):
    """Busca e consome o slug de um job em uma thread separada."""
    log_area = ui_elements["log_area"]
    log_area.log(f"Consumindo job com slug temporário: {slug}")
    
    try:
        # A URL agora aponta para a nova rota de consumo de slug
        response = requests.get(f"{API_BASE_URL}api/jobs/claim/{slug}")
        response.raise_for_status() # Lança erro para respostas 4xx/5xx
        
        data = response.json()
        if data.get("success"):            
            log_area.log("Job consumido e dados recebidos com sucesso!")
            # Passa os dados para a função de atualização da UI
            ui_elements["root"].after(0, update_ui_with_job_data, data["project"], ui_elements)
        else:
            error_message = data.get('error', 'Erro desconhecido ao consumir o slug.')
            log_area.log(f"Erro: {error_message}", "error")
            messagebox.showerror("Erro", error_message)

    except requests.exceptions.RequestException as e:
        # Trata erros de conexão e status HTTP (404, 500, etc.)
        if e.response is not None and e.response.status_code == 404:
            log_area.log("Erro: Slug inválido ou expirado.", "error")
            messagebox.showerror("Erro 404", "Slug inválido ou expirado. Peça um novo slug.")
            print(e.response.text)
        else:
            log_area.log(f"Erro de conexão: {e}", "error")
            messagebox.showerror("Erro de Conexão", f"Não foi possível conectar à API. Verifique se o servidor está rodando.\n\n{e}")
    except Exception as e:
        log_area.log(f"Ocorreu um erro inesperado: {e}", "error")
        messagebox.showerror("Erro Inesperado", str(e))


def update_ui_with_job_data(project_data, ui_elements):
    """Atualiza a UI com os dados do projeto recebido."""
    ui_elements["job_info"]["title"].config(text=project_data.get("title", "N/A"))
    ui_elements["job_info"]["type"].config(text=project_data.get("type", "N/A"))
    ui_elements["job_info"]["price"].config(text=f'{project_data.get("price", 0):.2f} ETH')
    ui_elements["job_info"]["dataset_link"].config(text=project_data.get("cloud_link", "Nenhum"))
    ui_elements["job_info"]["script_path"].config(text=project_data.get("script_path", "Nenhum"))
    
    # Guarda o ID do projeto e habilita o botão
    ui_elements["start_button"].config(state=tk.NORMAL)
    ui_elements["start_button"].project_id = project_data.get("id")
    ui_elements["start_button"].project_data = project_data # Guarda todos os dados


def start_job_execution(project_id, project_data, ui_elements):
    """Inicia a execução do trabalho em uma thread separada."""
    log_area = ui_elements["log_area"]
    log_area.clear()
    log_area.log(f"Iniciando trabalho para o projeto ID: {project_id}")
    ui_elements["start_button"].config(state=tk.DISABLED)
    ui_elements["fetch_button"].config(state=tk.DISABLED)

    try:
        # 1. Atualizar status para WORKING
        log_area.log("Atualizando status para: WORKING")
        update_status(project_id, "WORKING", log_area)

        # 2. Criar diretório e baixar arquivos
        job_dir = os.path.join(DOWNLOAD_DIR, str(project_id))
        os.makedirs(job_dir, exist_ok=True)
        log_area.log(f"Diretório de trabalho criado em: {job_dir}")

        script_url = f"{API_BASE_URL}{project_data['script_path']}"
        dataset_url = f"{API_BASE_URL}{project_data['cloud_link']}"

        local_script_path = download_file(script_url, job_dir, log_area)
        download_file(dataset_url, job_dir, log_area)

        # 3. Executar o script com subprocess
        log_area.log(f"Executando script: python3 {local_script_path}", "cmd")
        execute_script(f"{local_script_path.split("/")[-1]}", f"./{job_dir}", log_area)

        # 4. Atualizar status para COMPLETED
        log_area.log("Trabalho concluído com sucesso!", "success")
        update_status(project_id, "COMPLETED", log_area)
        messagebox.showinfo("Sucesso", "O trabalho foi concluído com sucesso!")

    except Exception as e:
        log_area.log(f"Falha na execução do trabalho: {e}", "error")
        update_status(project_id, "FAILED", log_area)
        messagebox.showerror("Erro no Trabalho", f"Ocorreu um erro: {e}")

    finally:
        # Reabilita os botões
        ui_elements["start_button"].config(state=tk.NORMAL)
        ui_elements["fetch_button"].config(state=tk.NORMAL)

def update_status(project_id, status, log_area):
    """Atualiza o status do projeto via API PUT."""
    try:
        response = requests.put(f"{API_BASE_URL}api/projects/{project_id}", json={"status": status})
        response.raise_for_status()
        log_area.log(f"Status atualizado para: {status}")
    except requests.exceptions.RequestException as e:
        log_area.log(f"Erro ao atualizar status: {e}", "error")
        # Lança a exceção para que o bloco principal possa tratá-la
        raise Exception(f"Não foi possível atualizar o status para {status}")

def download_file(url, dest_folder, log_area):
    """Baixa um arquivo de uma URL para uma pasta local."""
    if not url:
        log_area.log("URL de download não fornecida. Pulando.", "warning")
        return None
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        filename = os.path.basename(urlparse(url).path)
        local_path = os.path.join(dest_folder, filename)
        
        log_area.log(f"Baixando {filename} para {local_path}...")
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        log_area.log(f"{filename} baixado com sucesso.")
        return local_path
    except requests.exceptions.RequestException as e:
        raise Exception(f"Falha ao baixar o arquivo {url}. Erro: {e}")

def execute_script(script_path, work_dir, log_area):
    print("Executando script: args =", ["python3", script_path], "cwd =", work_dir)
    """Executa um script e transmite seu output para a área de log."""
    process = subprocess.Popen(
        ["python3", script_path],
        cwd=work_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1, # Line-buffered
        universal_newlines=True
    )

    # Lê stdout e stderr em tempo real
    for line in iter(process.stdout.readline, ''):
        log_area.log(line.strip(), "stdout")
    
    stderr_output = process.stderr.read()
    if stderr_output:
        log_area.log(stderr_output.strip(), "stderr")

    process.stdout.close()
    process.wait()

    if process.returncode != 0:
        raise Exception(f"O script falhou com código de saída {process.returncode}")

# --- Classes da UI --- #

class LogArea(scrolledtext.ScrolledText):
    """Área de texto customizada para logs com cores."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.config(state=tk.DISABLED, bg="black", fg="white", font=("monospace", 9))
        
        # Tags de cor
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
        self.see(tk.END) # Auto-scroll
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

        # --- Seção de Busca ---
        fetch_frame = ttk.Frame(main_frame)
        fetch_frame.pack(fill=tk.X, pady=5)

        ttk.Label(fetch_frame, text="Slug do Job:").pack(side=tk.LEFT, padx=(0, 5))
        slug_entry = ttk.Entry(fetch_frame, width=40)
        slug_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.ui_elements["slug_entry"] = slug_entry

        fetch_button = ttk.Button(fetch_frame, text="Buscar Job", command=self.on_fetch_click)
        fetch_button.pack(side=tk.LEFT, padx=(5, 0))
        self.ui_elements["fetch_button"] = fetch_button

        # --- Seção de Informações do Job ---
        job_info_frame = ttk.LabelFrame(main_frame, text="Informações do Job", padding="10")
        job_info_frame.pack(fill=tk.X, pady=10)
        self.ui_elements["job_info"] = {}

        info_labels = {
            "title": "Título:", "type": "Tipo:", "price": "Preço:",
            "dataset_link": "Link do Dataset:", "script_path": "Script:"
        }
        for i, (key, text) in enumerate(info_labels.items()):
            ttk.Label(job_info_frame, text=text, font=("Helvetica", 10, "bold")).grid(row=i, column=0, sticky=tk.W, pady=2)
            value_label = ttk.Label(job_info_frame, text="-", wraplength=450, justify=tk.LEFT)
            value_label.grid(row=i, column=1, sticky=tk.W, padx=5)
            self.ui_elements["job_info"][key] = value_label

        # --- Botão de Ação ---
        start_button = ttk.Button(main_frame, text="Iniciar Trabalho", state=tk.DISABLED, command=self.on_start_click)
        start_button.pack(fill=tk.X, pady=5)
        self.ui_elements["start_button"] = start_button

        # --- Área de Log ---
        log_frame = ttk.LabelFrame(main_frame, text="Log de Execução", padding="5")
        log_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        log_area = LogArea(log_frame, wrap=tk.WORD)
        log_area.pack(fill=tk.BOTH, expand=True)
        self.ui_elements["log_area"] = log_area

    def on_fetch_click(self):
        slug = self.ui_elements["slug_entry"].get()
        if not slug:
            messagebox.showwarning("Entrada Inválida", "Por favor, insira um slug.")
            return
        # Inicia a busca em uma nova thread
        thread = threading.Thread(target=fetch_job_data, args=(slug, self.ui_elements))
        thread.daemon = True
        thread.start()

    def on_start_click(self):
        project_id = getattr(self.ui_elements["start_button"], "project_id", None)
        project_data = getattr(self.ui_elements["start_button"], "project_data", None)
        if not project_id or not project_data:
            messagebox.showerror("Erro", "Dados do projeto não carregados. Busque o job primeiro.")
            return
        
        # Inicia a execução em uma nova thread
        thread = threading.Thread(target=start_job_execution, args=(project_id, project_data, self.ui_elements))
        thread.daemon = True
        thread.start()

# --- Ponto de Entrada --- #
if __name__ == "__main__":
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR)
    
    app = App()
    app.mainloop()
