import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

const App = () => {
  const [mostrar, setMostrar] = useState(false);
  const [perfil, setPerfil] = useState("");
  const [perfilData, setPerfilData] = useState(null);
  const [perfilCompleto, setPerfilCompleto] = useState(null);
  const [recentes, setRecentes] = useState([]);

  const buscador = () => {
    setMostrar(!mostrar);
    if (mostrar) {
      setPerfilCompleto(null);
      setPerfilData(null);
    }
  };

  const pesquisa = () => {
    axios.get(`https://api.github.com/users/${perfil}`)
      .then(res => {
        setPerfilData(res.data);
        setPerfilCompleto(null);
        setRecentes(prevRecentes => {
          // Evita duplicados e limita o número de usuários armazenados
          const novosRecentes = prevRecentes.filter(item => item.login !== res.data.login);
          return [res.data, ...novosRecentes].slice(0, 5);
        });
      })
      .catch(error => {
        console.error("Erro ao buscar o perfil:", error);
        setPerfilData(null);
      });
  };

  const carregarPerfilCompleto = () => {
    axios.get(`https://api.github.com/users/${perfil}`)
      .then(res => {
        axios.get(res.data.repos_url)
          .then(repos => {
            setPerfilCompleto({ ...res.data, repositorios: repos.data });
            setPerfilData(null);
          });
      })
      .catch(error => {
        console.error("Erro ao carregar o perfil completo:", error);
      });
  };

  const carregarPerfilRecente = (login) => {
    setPerfil(login);
    pesquisa();
  };

  const voltar = () => {
    setPerfilCompleto(null);
    pesquisa();
  };

  return (
    <div>
      <h1 className='titulo'>
        Busca de perfis GitHub
      </h1>
      <div className='container'>
        <div className="menu-recentes">
          <h2>Recentes:</h2>
          <ul>
            {recentes.map((usuario) => (
              <li key={usuario.id} onClick={() => carregarPerfilRecente(usuario.login)}>
                <img src={usuario.avatar_url} alt={usuario.login} />
                <p>{usuario.name || "Nome não disponível"}</p>
                <small>{usuario.login}</small>
                <small>{usuario.location || "Localização não disponível"}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className="buscador">
          <button
            onClick={buscador}
            className={`btn-buscar ${mostrar ? 'ocultar-busca' : 'mostrar-busca'}`}
          >
            {mostrar ? 'Ocultar Busca' : 'Mostrar Busca'}
          </button>

          {mostrar && (
            <>
              <div className='input-pesquisa'>
                <input
                  type="text"
                  placeholder="Digite sua busca..."
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                />
                <button className='btn-pesquisa' onClick={pesquisa}>Buscar</button>
              </div>
              {perfilData && !perfilCompleto && (
                <div className="secao-buscar">
                  <img
                    src={perfilData.avatar_url}
                    alt='Foto de Perfil'
                    onClick={carregarPerfilCompleto}
                    style={{ cursor: 'pointer' }}
                  />
                  <hr />
                  <h3>{perfilData.name || "Nome não disponível"}</h3>
                  <hr />
                  <h4>{perfilData.login}</h4>
                  <hr />
                  <small>{perfilData.location || "Localização não disponível"}</small>
                </div>
              )}
              {perfilCompleto && (
                <div className="secao-buscar">
                  <button onClick={voltar} className='btn-pesquisa'>Voltar</button>
                  <img src={perfilCompleto.avatar_url} alt='Foto de Perfil' />
                  <h3>{perfilCompleto.name}</h3>
                  <p>Login: {perfilCompleto.login}</p>
                  <p>ID: {perfilCompleto.id}</p>
                  <p>Localização: {perfilCompleto.location || "Não disponível"}</p>
                  <p>Seguidores: {perfilCompleto.followers}</p>
                  <p>Repositórios Públicos: {perfilCompleto.public_repos}</p>
                  <div>
                    <h4>Repositórios:</h4>
                    <ul>
                      {perfilCompleto.repositorios.map(repo => (
                        <li key={repo.id}>
                          <p><a href={repo.html_url} target="_blank" rel="noopener noreferrer"><strong>{repo.name}</strong></a></p>
                          <p>Linguagem: {repo.language || "Não especificada"}</p>
                          <p>Descrição: {repo.description || "Sem descrição"}</p>
                          <p>Data de Criação: {new Date(repo.created_at).toLocaleDateString()}</p>
                          <p>Último Push: {new Date(repo.pushed_at).toLocaleDateString()}</p>
                          <hr />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
