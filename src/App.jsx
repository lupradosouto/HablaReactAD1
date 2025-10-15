import React, { useState, useEffect } from "react";

// URL da API
const API_URL = "https://68eed6c7b06cc802829b6f18.mockapi.io/habla1/contatos";

function App() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    plano: "",
  });
  const [mensagem, setMensagem] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [contatos, setContatos] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [contatoEditando, setContatoEditando] = useState(null);

  // Efeito para carregar os contatos ao montar o componente
  useEffect(() => {
    listarContatos();
  }, []);

  // Função para lidar com a mudança nos inputs do formulário
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Funções CRUD ---

  // R - Listar (Retrieve) todos os objetos
  const listarContatos = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setContatos(data);
      } else {
        console.error("Erro ao carregar contatos. Status:", response.status);
        setMensagem(`Erro ao carregar lista. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Erro de conexão ao listar contatos:", error);
      setMensagem("Erro de conexão com o servidor ao carregar contatos.");
    }
  };

  // C - Criar (Create) ou U - Atualizar (Update) um objeto
  const handleSubmit = async () => {
    const { nome, email, whatsapp, plano } = form;

    if (nome && email && whatsapp && plano) {
      const method = modoEdicao ? "PUT" : "POST";

      // CRÍTICO: Anexa o ID à URL apenas em modo de edição (PUT)
      const url = modoEdicao ? `${API_URL}/${contatoEditando.id}` : API_URL;

      // Os dados enviados são o estado atual do formulário
      const dadosParaEnviar = form;

      try {
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosParaEnviar),
        });

        if (response.ok) {
          setMensagem(
            modoEdicao
              ? "Cliente atualizado com sucesso!"
              : "PARABÉNS! Cliente cadastrado e plano contratado com sucesso!"
          );
          setMostrarFormulario(false);
          limparFormulario();
          listarContatos(); // Recarrega a lista
          setModoEdicao(false);
          setContatoEditando(null);
        } else {
          // DEBUG AVANÇADO: Exibe o código de erro para identificar 404
          const errorText = await response.text();
          console.error(
            `Erro ao enviar/atualizar (Status: ${response.status}):`,
            errorText
          );
          setMensagem(
            `ERRO (Status: ${response.status}). Verifique o ID no MockAPI.`
          );
        }
      } catch (error) {
        console.error("Erro de conexão ao enviar/atualizar:", error);
        setMensagem("Erro de conexão com o servidor.");
      }
    } else {
      setMensagem("PREENCHA TODOS OS CAMPOS");
    }
  };

  // D - Remover (Delete) um objeto
  const removerContato = async (id) => {
    // Proteção: Garante que o ID é válido antes de tentar a exclusão
    if (!id) {
      setMensagem("Erro: ID do cliente é inválido para remoção.");
      console.error("Tentativa de remover cliente com ID inválido.");
      return;
    }

    if (window.confirm(`Tem certeza que deseja remover o cliente ID ${id}?`)) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setMensagem("Cliente removido com sucesso!");
          listarContatos(); // Recarrega a lista
        } else {
          // DEBUG AVANÇADO: Exibe o código de erro para identificar 404
          const errorText = await response.text();
          console.error(
            `Erro ao remover o cliente (Status: ${response.status}):`,
            errorText
          );
          setMensagem(
            `ERRO ao remover (Status: ${response.status}). Verifique o ID no MockAPI.`
          );
        }
      } catch (error) {
        console.error("Erro de conexão ao remover o cliente:", error);
        setMensagem("Erro de conexão ao remover o cliente.");
      }
    }
  };

  // Função para preparar a edição
  const iniciarEdicao = (contato) => {
    setForm({
      nome: contato.nome,
      email: contato.email,
      whatsapp: contato.whatsapp,
      plano: contato.plano,
    });
    setContatoEditando(contato);
    setModoEdicao(true);
    setMostrarFormulario(true);
    setMensagem(`Editando cliente ID: ${contato.id}`);
  };

  // --- Funções de Controle de Formulário e Renderização ---

  const limparFormulario = () => {
    setForm({ nome: "", email: "", whatsapp: "", plano: "" });
    setMensagem("");
    setModoEdicao(false);
    setContatoEditando(null);
  };

  const novoCadastro = () => {
    limparFormulario();
    setMostrarFormulario(true);
  };

  // Renderiza a lista de contatos (Retrieve)
  const renderContatos = () => (
    <section style={styles.listagem}>
      <h2 style={{ marginTop: 20 }}>
        Clientes Cadastrados ({contatos.length})
      </h2>
      {contatos.length === 0 ? (
        <p>Nenhum cliente cadastrado.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>E-mail</th>
              <th style={styles.th}>Plano</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contatos.map((contato) => (
              <tr key={contato.id}>
                <td style={styles.td}>{contato.id}</td>
                <td style={styles.td}>{contato.nome}</td>
                <td style={styles.td}>{contato.email}</td>
                <td style={styles.td}>{contato.plano}</td>
                <td style={styles.td}>
                  <button
                    // Garante que o objeto completo é passado
                    onClick={() => iniciarEdicao(contato)}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: "#007bff",
                    }}
                  >
                    Editar ✏️
                  </button>
                  <button
                    // Garante que apenas o ID é passado
                    onClick={() => removerContato(contato.id)}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: "#dc3545",
                    }}
                  >
                    Remover 🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <h1>Cadastro de Clientes Habla Caça</h1>
        <p>Olá, seja bem-vindo(a)!</p>
      </header>

      <main>
        <section style={styles.descricao}>
          <h2>
            {modoEdicao
              ? "Atualize os dados do cliente"
              : "Cadastre um Novo Cliente"}
          </h2>
          <p>
            {modoEdicao
              ? `Edição ativa para o cliente ID: ${contatoEditando?.id}. Salve ou Cancele.`
              : "Preencha o formulário abaixo para realizar o cadastro e contratar um plano, ou veja os clientes cadastrados."}
          </p>
        </section>

        <section style={styles.tabela}>
          <h3>Planos disponíveis</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Plano</th>
                <th style={styles.th}>Descrição</th>
                <th style={styles.th}>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Básico</td>
                <td style={styles.td}>Ideal para iniciantes</td>
                <td style={styles.td}>R$ 50,00</td>
              </tr>
              <tr>
                <td style={styles.td}>Intermediário</td>
                <td style={styles.td}>Mais recursos e suporte</td>
                <td style={styles.td}>R$ 150,00</td>
              </tr>
              <tr>
                <td style={styles.td}>Avançado</td>
                <td style={styles.td}>Para uso profissional</td>
                <td style={styles.td}>R$ 300,00</td>
              </tr>
              <tr>
                <td style={styles.td}>Plus</td>
                <td style={styles.td}>Plano completo com benefícios extras</td>
                <td style={styles.td}>R$ 500,00</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={styles.formulario}>
          {mensagem && (
            <p
              style={{
                ...styles.mensagem,
                color:
                  mensagem.includes("sucesso") || mensagem.includes("Editando")
                    ? "limegreen"
                    : mensagem.includes("ERRO")
                    ? "red"
                    : "orange",
              }}
            >
              {mensagem}
            </p>
          )}

          {mostrarFormulario ? (
            <form style={styles.form}>
              <label style={styles.label}>Nome:</label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Nome do Cliente"
                required
                style={styles.input}
              />

              <label style={styles.label}>E-mail:</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="E-mail do Cliente"
                required
                style={styles.input}
              />

              <label style={styles.label}>WhatsApp:</label>
              <input
                type="tel"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="Fone com DDD"
                required
                style={styles.input}
              />

              <label style={styles.label}>Plano Escolhido:</label>
              <select
                name="plano"
                value={form.plano}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Selecione um plano</option>
                <option value="basico">Básico</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
                <option value="plus">Plus</option>
              </select>

              <div style={styles.botoes}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={styles.button}
                >
                  {modoEdicao ? "Salvar Alterações" : "Enviar Cadastro"}
                </button>
                <button
                  type="button"
                  onClick={limparFormulario}
                  style={{
                    ...styles.button,
                    backgroundColor: "#eee",
                    color: "black",
                  }}
                >
                  {modoEdicao ? "Cancelar Edição" : "Limpar"}
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.botoes}>
              <button onClick={novoCadastro} style={styles.button}>
                Novo Cadastro
              </button>
              <button
                onClick={() => {
                  setMensagem("");
                  setMostrarFormulario(false);
                  listarContatos();
                }}
                style={{
                  ...styles.button,
                  backgroundColor: "#ddf",
                  color: "black",
                }}
              >
                Ver Clientes Cadastrados
              </button>
            </div>
          )}
        </section>

        {/* Listagem de Contatos (Retrieve) */}
        {!mostrarFormulario && renderContatos()}
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2025 Habla Caça - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

// Estilos (mantidos inalterados)
const styles = {
  body: {
    backgroundColor: "purple",
    color: "white",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    margin: 0,
    padding: 0,
  },
  header: {
    padding: 20,
  },
  descricao: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
  },
  tabela: {
    margin: "20px auto",
    width: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    borderRadius: 10,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
    margin: "15px 0",
  },
  th: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 10,
    borderBottom: "1px solid white",
  },
  td: {
    padding: 10,
    borderBottom: "1px solid white",
    verticalAlign: "middle",
  },
  formulario: {
    padding: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    borderRadius: 10,
    width: "50%",
    margin: "auto",
    minWidth: "300px",
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
    alignSelf: "flex-start",
    marginLeft: "10%",
  },
  input: {
    width: "80%",
    padding: 10,
    marginTop: 5,
    border: "none",
    borderRadius: 5,
  },
  botoes: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: 20,
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "white",
    color: "purple",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "10px 15px",
    borderRadius: 5,
    border: "none",
    minWidth: "150px",
  },
  actionButton: {
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: 5,
    border: "none",
    margin: "2px",
    fontSize: "0.85em",
  },
  mensagem: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
  },
  listagem: {
    margin: "20px auto",
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    borderRadius: 10,
  },
};

export default App;
