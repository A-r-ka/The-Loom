
// ------------------------------------------------------------------
// R - READ (Ler UM projeto específico)
// ------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const id = params.id; // Pega o 'id' da URL (ex: /api/projects/123)

    const project = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// U - UPDATE (Atualizar UM projeto)
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const { name, valor, type } = await request.json();

    // Validações (iguais às do POST)
    if (!name || !valor || !type) {
      return NextResponse.json(
        { error: 'Campos "name", "valor" e "type" são obrigatórios' },
        { status: 400 }
      );
    }
    if (type !== 'entrada' && type !== 'saida') {
      return NextResponse.json(
        { error: 'O campo "type" deve ser "entrada" ou "saida"' },
        { status: 400 }
      );
    }

    const result = await new Promise((resolve, reject) => {
      // 'function' para pegar o 'this.changes'
      db.run(
        'UPDATE projects SET name = ?, valor = ?, type = ? WHERE id = ?',
        [name, valor, type, id],
        function (err) {
          if (err) reject(err);
          // 'this.changes' diz quantas linhas foram afetadas
          resolve({ changes: this.changes });
        }
      );
    });

    // Se nenhuma linha mudou, é porque o ID não foi encontrado
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id, name, valor, type });
  } catch (error) {
    // Trata o erro de restrição (CHECK) do banco
    if (error.message.includes('CHECK constraint failed')) {
      return NextResponse.json(
        { error: 'O campo "type" deve ser "entrada" ou "saida"' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ------------------------------------------------------------------
// D - DELETE (Deletar UM projeto)
// ------------------------------------------------------------------
export async function DELETE(request, { params }) {
  try {
    const id = params.id;

    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        resolve({ changes: this.changes });
      });
    });

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Retorna uma resposta vazia com status 204 (No Content)
    // ou uma mensagem de sucesso
    return NextResponse.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}// Em: app/api/projects/[id]/route.js

import { NextResponse } from 'next/server';
import db from '@/database.js'; // ou '../../database.js'

// ------------------------------------------------------------------
// R - READ (Ler UM projeto específico)
// ------------------------------------------------------------------
export async function GET(request, { params }) {
  try {
    const id = params.id; // Pega o 'id' da URL (ex: /api/projects/123)

    const project = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ------------------------------------------------------------------
// U - UPDATE (Atualizar UM projeto)
// ------------------------------------------------------------------
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const { name, valor, type } = await request.json();

    // Validações (iguais às do POST)
    if (!name || !valor || !type) {
      return NextResponse.json(
        { error: 'Campos "name", "valor" e "type" são obrigatórios' },
        { status: 400 }
      );
    }
    if (type !== 'entrada' && type !== 'saida') {
      return NextResponse.json(
        { error: 'O campo "type" deve ser "entrada" ou "saida"' },
        { status: 400 }
      );
    }

    const result = await new Promise((resolve, reject) => {
      // 'function' para pegar o 'this.changes'
      db.run(
        'UPDATE projects SET name = ?, valor = ?, type = ? WHERE id = ?',
        [name, valor, type, id],
        function (err) {
          if (err) reject(err);
          // 'this.changes' diz quantas linhas foram afetadas
          resolve({ changes: this.changes });
        }
      );
    });

    // Se nenhuma linha mudou, é porque o ID não foi encontrado
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id, name, valor, type });
  } catch (error) {
    // Trata o erro de restrição (CHECK) do banco
    if (error.message.includes('CHECK constraint failed')) {
      return NextResponse.json(
        { error: 'O campo "type" deve ser "entrada" ou "saida"' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ------------------------------------------------------------------
// D - DELETE (Deletar UM projeto)
// ------------------------------------------------------------------
export async function DELETE(request, { params }) {
  try {
    const id = params.id;

    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        resolve({ changes: this.changes });
      });
    });

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Retorna uma resposta vazia com status 204 (No Content)
    // ou uma mensagem de sucesso
    return NextResponse.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}