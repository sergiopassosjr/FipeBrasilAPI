const BASE_URL = "https://brasilapi.com.br/api/fipe";

// Remove as opções internas (innerHTML = "") de múltiplos elementos <select>.
function limparDropdowns(ids) {
    ids.forEach(id => {
        document.getElementById(id).innerHTML = "";
    });
}

// Aplica o atributo booleano 'disabled' a uma lista de botões.
function desabilitarBotoes(ids) {
    ids.forEach(id => {
        document.getElementById(id).disabled = true;
    });
}

// Remove o atributo booleano 'disabled' de um botão específico.
function habilitarBotao(id) {
    document.getElementById(id).disabled = false;
}

// Event Listeners para reset em cascata das dropdowns e botões, quando o usuário altera seleções
document.getElementById('tipoVeiculo').addEventListener('change', () => {
    limparDropdowns(['marcaVeiculo', 'modeloVeiculo', 'anoVeiculo']);
    desabilitarBotoes(['btnBuscarModelos', 'btnBuscarAnos', 'btnConsultar']);
});

document.getElementById('marcaVeiculo').addEventListener('change', () => {
    limparDropdowns(['modeloVeiculo', 'anoVeiculo']);
    desabilitarBotoes(['btnBuscarAnos', 'btnConsultar']);
});

document.getElementById('modeloVeiculo').addEventListener('change', () => {
    limparDropdowns(['anoVeiculo']);
    desabilitarBotoes(['btnConsultar']);
});

// Obtém as marcas com base no tipo de veículo.
async function buscarMarcas() {
    const tipo = document.getElementById("tipoVeiculo").value;
    const status = document.getElementById("status");
    const marcaDropdown = document.getElementById("marcaVeiculo");
    
    limparDropdowns(['modeloVeiculo', 'anoVeiculo']);
    desabilitarBotoes(['btnBuscarModelos', 'btnBuscarAnos', 'btnConsultar']);
    
    status.textContent = "Carregando marcas...";
    marcaDropdown.innerHTML = "";

    try {
        const response = await fetch(`${BASE_URL}/marcas/v1/${tipo}`);
        
        if (!response.ok) {
            const erroApi = await response.json();
            throw new Error(erroApi.message || "Erro ao carregar marcas na API BrasilAPI.");
        }
        
        const marcas = await response.json();
        marcas.forEach(marca => {
            const option = document.createElement("option");
            option.value = marca.valor;
            option.textContent = marca.nome;
            marcaDropdown.appendChild(option);
        });
        
        habilitarBotao('btnBuscarModelos');
        status.textContent = "";
    } catch (error) {
        status.textContent = error.message;
        status.classList.add("text-red-500");
    }
}

// Obtém os modelos com base no tipo e na marca selecionada.
async function buscarModelos() {
    const tipo = document.getElementById("tipoVeiculo").value;
    const marca = document.getElementById("marcaVeiculo").value;
    const status = document.getElementById("status");
    const modeloDropdown = document.getElementById("modeloVeiculo");
    
    limparDropdowns(['anoVeiculo']);
    desabilitarBotoes(['btnBuscarAnos', 'btnConsultar']);
    
    status.textContent = "Carregando modelos...";
    modeloDropdown.innerHTML = "";

    try {
        const response = await fetch(`${BASE_URL}/veiculos/v1/${tipo}/${marca}`);
        
        if (!response.ok) {
            const erroApi = await response.json();
            throw new Error(erroApi.message || "Erro ao carregar modelos na API BrasilAPI.");
        }
        
        const listaModelos = await response.json();
        
        if (!Array.isArray(listaModelos)) {
            throw new Error("Formato de dados inválido. A API não retornou uma lista de modelos.");
        }
        
        listaModelos.forEach(modelo => {
            const option = document.createElement("option");
            option.value = modelo.valor;
            option.textContent = modelo.modelo; 
            modeloDropdown.appendChild(option);
        });
        
        habilitarBotao('btnBuscarAnos');
        status.textContent = "";
    } catch (error) {
        status.textContent = error.message;
        status.classList.add("text-red-500");
    }
}

// Obtém os anos de fabricação disponíveis para o modelo.
async function buscarAnos() {
    const tipo = document.getElementById("tipoVeiculo").value;
    const marca = document.getElementById("marcaVeiculo").value;
    const modelo = document.getElementById("modeloVeiculo").value;
    const status = document.getElementById("status");
    const anoDropdown = document.getElementById("anoVeiculo");
    
    desabilitarBotoes(['btnConsultar']);
    
    status.textContent = "Carregando anos...";
    anoDropdown.innerHTML = "";

    try {
        const response = await fetch(`${BASE_URL}/anos/v1/${tipo}/${marca}/${modelo}`);
        
        if (!response.ok) {
            const erroApi = await response.json();
            throw new Error(erroApi.message || "Erro ao carregar anos na API BrasilAPI.");
        }
        
        const anos = await response.json();
        anos.forEach(ano => {
            const option = document.createElement("option");
            option.value = ano.valor;
            option.textContent = ano.nome;
            anoDropdown.appendChild(option);
        });
        
        habilitarBotao('btnConsultar');
        status.textContent = "";
    } catch (error) {
        status.textContent = error.message;
        status.classList.add("text-red-500");
    }
}

// Faz o fetch final.
async function consultarPrecoFipe() {
    const tipo = document.getElementById("tipoVeiculo").value;
    const marca = document.getElementById("marcaVeiculo").value;
    const modelo = document.getElementById("modeloVeiculo").value;
    const ano = document.getElementById("anoVeiculo").value;
    const status = document.getElementById("status");
    const resultadoFipe = document.getElementById("resultadoFipe");

    status.classList.remove("text-red-500");
    status.textContent = "Processando a requisição...";
    resultadoFipe.innerHTML = "";

    try {
        const response = await fetch(`${BASE_URL}/detalhes/v1/${tipo}/${marca}/${modelo}/${ano}`);
        
        if (!response.ok) {
            const erroApi = await response.json();
            throw new Error(erroApi.message || "Erro ao consultar preço na API BrasilAPI.");
        }
        
        const veiculo = await response.json();
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50 transition-colors";
        
        tr.innerHTML = `
            <td class="py-3 px-4 text-gray-800">${veiculo.marca}</td>
            <td class="py-3 px-4 text-gray-800">${veiculo.modelo}</td>
            <td class="py-3 px-4 text-gray-800">${veiculo.anoModelo}</td>
            <td class="py-3 px-4 font-bold text-green-700">${veiculo.valor}</td>
        `;
        
        resultadoFipe.appendChild(tr);
        status.textContent = "";
    } catch (error) {
        status.textContent = error.message;
        status.classList.add("text-red-500");
    }
}