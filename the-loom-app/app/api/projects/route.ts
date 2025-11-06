// Em: app/api/projects/route.js

import { NextResponse } from 'next/server';
// Ajuste o caminho para onde você salvou seu arquivo de banco
// O '@' é um atalho para a raiz, se você configurou. 
// Senão, use '../..'
import db from '@/database.js'; // ou '../../database.js'

// ------------------------------------------------------------------
// R - READ (Ler TODOS os projetos)
// ------------------------------------------------------------------
export async function GET() {
  try {
    // A biblioteca 'sqlite3' usa callbacks.
    // Precisamos "promisify" (transformar em Promise) para usar async/await
    const projects = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM projects', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ------------------------------------------------------------------
// C - CREATE (Criar UM novo projeto)
// ------------------------------------------------------------------
export async function POST(request) {
  try {
    const { name, valor, type } = await request.json();

    // Validação simples
    if (!name || !valor || !type) {
      return NextResponse.json(
        { error: 'Campos "name", "valor" e "type" são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação do 'type' que definimos no banco
    if (type !== 'entrada' && type !== 'saida') {
      return NextResponse.json(
        { error: 'O campo "type" deve ser "entrada" ou "saida"' },
        { status: 400 }
      );
    }

    const result = await new Promise((resolve, reject) => {
      // Usamos 'function' normal aqui para ter acesso ao 'this.lastID'
      db.run(
        'INSERT INTO projects (name, valor, type) VALUES (?, ?, ?)',
        [name, valor, type],
        function (err) { // NÃO use arrow function aqui
          if (err) {
            reject(err);
          } else {
            // 'this.lastID' nos dá o ID do item que acabamos de inserir
            resolve({ lastID: this.lastID });
          }
        }
      );
    });

    // Retorna o objeto recém-criado com seu novo ID
    return NextResponse.json(
      { id: result.lastID, name, valor, type },
      { status: 201 } // 201 = Created
    );
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