# Raio-X Popfidelidade

Dashboard interativo para análise e segmentação da base de clientes de programas de fidelidade. Importa dados CSV/Excel da plataforma Popfidelidade, processa métricas de comportamento e gera listas de ação exportáveis para campanhas de CRM.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

---

## Funcionalidades

### Upload e Processamento
- Importação de arquivos `.csv`, `.xlsx` e `.xls` via drag & drop ou seleção manual
- Parsing automático com PapaParse (CSV) e SheetJS (Excel)
- Mapeamento fuzzy de colunas — aceita variações de nome sem quebrar
- Detecção automática de encoding (UTF-8 / Latin-1)
- Suporte a múltiplos arquivos simultâneos

### KPIs Gerais
- **Taxa de Engajamento** — % de clientes que fizeram ao menos um resgate
- **Adoção Digital** — % de clientes que usam o aplicativo
- **Mortalidade da Base** — clientes inativos há mais de 180 dias
- **Receita Total** e **Ticket Médio Geral**
- **Total de Compras** e **Resgates Realizados**

### Segmentação Automática
A base é segmentada em 9 grupos por regras de negócio:

| Segmento | Regra |
|---|---|
| **Ação Ouro - Baixar App** | Ticket > R$100 + Compras > 5 + Sem App |
| **Risco Urgente - Salvar** | Receita > R$500 + Inativos 30-90 dias |
| **Forçar Resgate** | Saldo > 1.000 + 0 Resgates + Inativos > 45 dias |
| **Campeões** | Compras > 20 + Inativos <= 15 dias |
| **Perdidos (+180d)** | Inativos > 180 dias |
| **Hibernando (90-180d)** | Inativos 90-180 dias |
| **Compra Única** | Apenas 1 compra ou menos |
| **Novatos Ativos** | Compras <= 5 + Inativos <= 30 dias |
| **Base Regular** | Demais clientes |

### Cards de Ação
Os 4 primeiros segmentos geram cards acionáveis com:
- Descrição de quem são os clientes
- Sugestão de ação (campanha, contato, resgate)
- Receita em jogo
- Botão para **exportar lista em CSV** para uso direto em campanhas

### Análise de Comportamento
- Média de dias entre compras da base
- Clientes fora do ciclo habitual de compra
- Situação da base: Ativos (0-30d) / Alerta (31-90d) / Frios (91-180d) / Perdidos (+180d)
- Histograma de frequência de compra (semanal, quinzenal, mensal, etc.)

### Métricas Derivadas por Cliente
- **Ciclo de Vida** — dias entre primeira e última compra
- **Frequência Média** — dias entre compras (ciclo / total de compras)
- **Risco de Fuga (%)** — dias inativos / frequência média

### Desempenho por Loja
Tabela com ranking de lojas exibindo:
- Total de clientes, receita, compras
- Inativos 90d+
- % de adoção do app
- Barra de participação na receita
- Ordenação por qualquer coluna

### Tabela Top 100 Clientes
- Top 100 por receita com ordenação dinâmica
- Filtro por segmento (clicando nos cards de ação)
- Badges coloridos de inatividade
- Indicador visual de uso do app

### Outros
- **Filtro global por loja** no header
- **Tema claro e escuro** com persistência em localStorage
- **Design responsivo** — funciona em desktop, tablet e mobile
- Interface glassmorphism com animações suaves

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| [React 19](https://react.dev) | Interface de usuário |
| [Vite 8](https://vite.dev) | Build e dev server |
| [Tailwind CSS 4](https://tailwindcss.com) | Estilização |
| [Recharts](https://recharts.org) | Gráficos |
| [PapaParse](https://www.papaparse.com) | Parsing de CSV |
| [SheetJS (xlsx)](https://sheetjs.com) | Parsing de Excel |
| [Lucide React](https://lucide.dev) | Ícones |

---

## Como Rodar

```bash
# Clonar o repositório
git clone https://github.com/mbu3no/raio-X-fidelidade.git
cd raio-X-fidelidade

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

O app abre em `http://localhost:5173`.

### Build para produção

```bash
npm run build
npm run preview
```

Os arquivos de produção são gerados na pasta `dist/`.

---

## Como Usar

1. Abra o dashboard no navegador
2. Arraste ou selecione os arquivos CSV/Excel exportados da plataforma Popfidelidade
3. Clique em **Processar**
4. Navegue pelos KPIs, segmentos e tabelas
5. Filtre por loja usando o seletor no header
6. Clique em um card de ação para filtrar a tabela de clientes
7. Exporte listas de clientes em CSV para campanhas

### Colunas Esperadas nos Arquivos

O dashboard aceita variações de nome, mas espera encontrar colunas equivalentes a:

| Campo | Exemplos aceitos |
|---|---|
| Cliente | `Cliente` |
| Categoria | `Categoria` |
| Loja | `Loja de Cadastro`, `Loja` |
| Data Primeira Compra | `Data Primeira Compra`, `Data da Primeira Compra` |
| Dias Inativo | `Dias Inativo`, `Dias Inativos` |
| Data Última Compra | `Data Última Compra`, `Data da Última Compra` |
| Ticket Médio | `Ticket Médio (R$)`, `Ticket Médio` |
| Receita | `Receita (R$)`, `Receita` |
| Saldo | `Saldo` |
| Compras | `Compras` |
| Resgates | `Resgates` |
| Aplicativo | `Aplicativo` (Sim/Não) |

---

## Estrutura do Projeto

```
src/
  App.jsx                        # Componente raiz, gerencia estado global
  main.jsx                       # Entry point
  index.css                      # Tema dark/light, glassmorphism, animações
  App.css                        # Estilos adicionais
  components/
    UploadScreen.jsx              # Tela de upload com drag & drop
    Header.jsx                    # Header com filtro de loja e toggle de tema
    KpiCards.jsx                  # 6 cards de KPIs gerais
    SegmentDistribution.jsx       # Barra de composição e legenda dos segmentos
    ActionCards.jsx               # 4 cards de ação com exportação CSV
    BehaviorSection.jsx           # Análise de comportamento e frequência
    StoreBreakdown.jsx            # Tabela de desempenho por loja
    ClientTable.jsx               # Tabela top 100 clientes
  utils/
    processData.js                # Parsing, normalização e segmentação
    exportCsv.js                  # Exportação de listas em CSV
```

---

## Licença

MIT
