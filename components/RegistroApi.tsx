'use client';

// ==========================================================================
// COMPONENTE · Painel "Requisições": mostra cada chamada à API
// (método, endereço, código de resposta e tempo).
// ==========================================================================
import { useState, useSyncExternalStore } from 'react';
import { Activity, Trash2, X } from 'lucide-react';
import {
  assinarRegistros,
  descreverStatus,
  lerRegistros,
  lerRegistrosNoServidor,
  limparRegistros,
} from '@/lib/registro';

// Classe de cor pelo resultado: sucesso, erro de dados (4xx) ou falha (5xx / sem conexão)
function tipoStatus(status: number) {
  if (status >= 200 && status < 300) return 'ok';
  if (status >= 400 && status < 500) return 'aviso';
  return 'falha';
}

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR');
}

// Painel com as últimas requisições feitas à API (para acompanhar a comunicação front-end/back-end)
export default function RegistroApi() {
  const [aberto, setAberto] = useState(false);
  const registros = useSyncExternalStore(assinarRegistros, lerRegistros, lerRegistrosNoServidor);
  const ultimo = registros[0];

  return (
    <div className="registro">
      {aberto && (
        <section id="painel-registro" className="registro-painel" aria-label="Registro de requisições à API">
          <div className="registro-topo">
            <div>
              <h2 className="registro-titulo">Requisições à API</h2>
              <p className="registro-sub">Também aparecem no console do navegador (F12).</p>
            </div>
            <div className="registro-acoes">
              <button
                type="button"
                className="botao-icone"
                onClick={limparRegistros}
                aria-label="Limpar registro"
                title="Limpar"
                disabled={registros.length === 0}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
              <button type="button" className="botao-icone" onClick={() => setAberto(false)} aria-label="Fechar registro">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {registros.length === 0 ? (
            <p className="registro-vazio">Nenhuma requisição ainda. Navegue pelo site para ver as chamadas aqui.</p>
          ) : (
            <ol className="registro-lista">
              {registros.map((r) => (
                <li key={r.id} className="registro-item">
                  <span className={`metodo metodo-${r.metodo.toLowerCase()}`}>{r.metodo}</span>
                  <span className="registro-caminho" title={r.caminho}>
                    {r.caminho}
                  </span>
                  <span className={`status status-${tipoStatus(r.status)}`}>
                    {r.status || '---'} {descreverStatus(r.status)}
                  </span>
                  <span className="registro-meta">
                    {hora(r.horario)} · {r.duracaoMs} ms
                    {tipoStatus(r.status) !== 'ok' && ` · ${r.mensagem}`}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <button
        type="button"
        className="registro-botao"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        aria-controls="painel-registro"
      >
        <Activity size={17} aria-hidden="true" />
        Requisições
        <span className="registro-contador">{registros.length}</span>
        {ultimo && <span className={`registro-ponto status-${tipoStatus(ultimo.status)}`} aria-hidden="true" />}
      </button>
    </div>
  );
}
