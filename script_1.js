// Função para carregar estados brasileiros usando a API do IBGE
async function loadStates() {
    try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const states = await response.json();
        const estadoSelect = document.getElementById('estado');
        
        estadoSelect.innerHTML = '<option value="">Selecione</option>';
        
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state.sigla;
            option.textContent = state.nome;
            estadoSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar estados:", error);
        alert("Erro ao carregar estados. Tente novamente mais tarde.");
    }
}

// Função para carregar cidades com base no estado selecionado
async function loadCities() {
    const estadoId = document.getElementById('estado').value;
    const cidadeSelect = document.getElementById('cidade');
    cidadeSelect.innerHTML = "<option value=''>Carregando...</option>";

    if (!estadoId) {
        cidadeSelect.innerHTML = "<option value=''>Selecione um estado primeiro</option>";
        return;
    }

    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`);
        const cities = await response.json();
        
        cidadeSelect.innerHTML = '<option value="">Selecione</option>';
        
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.nome;
            option.textContent = city.nome;
            cidadeSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
        alert("Erro ao carregar cidades. Tente novamente mais tarde.");
    }
}

// Função para buscar dados do clima para as próximas 24 horas em intervalos de 3 horas
async function updateWeatherData() {
    const apiKey = 'b9ea1266871e2048573feeb3bedcc4fd';
    const city = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;

    if (!city || !estado) {
        alert("Por favor, selecione uma cidade e um estado.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${estado},BR&appid=${apiKey}&lang=pt&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro da API:", errorData);
            throw new Error(`Erro ${response.status}: ${errorData.message}`);
        }

        const data = await response.json();

        // Selecionar apenas as primeiras 8 previsões de 3 em 3 horas (24 horas no total)
        const next24HoursForecasts = data.list.slice(0, 8);

        populateWeatherTable(next24HoursForecasts);
    } catch (error) {
        console.error("Erro ao buscar dados climáticos:", error);
        alert("Houve um erro ao buscar os dados climáticos: " + error.message);
    }
}

// Modificar a função para preencher a tabela com previsões das próximas 24 horas
function populateWeatherTable(forecasts) {
    const tableBody = document.getElementById('tabela-clima').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = "";

    forecasts.forEach(data => {
        const row = document.createElement('tr');

        const timeCell = document.createElement('td');
        timeCell.textContent = new Date(data.dt * 1000).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
        row.appendChild(timeCell);

        const conditionCell = document.createElement('td');
        conditionCell.textContent = data.weather[0].description;
        row.appendChild(conditionCell);

        const tempCell = document.createElement('td');
        tempCell.textContent = `${data.main.temp}°C`;
        row.appendChild(tempCell);

        const feelsLikeCell = document.createElement('td');
        feelsLikeCell.textContent = `${data.main.feels_like}°C`;
        row.appendChild(feelsLikeCell);

        const humidityCell = document.createElement('td');
        humidityCell.textContent = `${data.main.humidity}%`;
        row.appendChild(humidityCell);

        const windCell = document.createElement('td');
        windCell.textContent = `${data.wind.speed} Kph`;
        row.appendChild(windCell);

        tableBody.appendChild(row);
    });

    // Atualiza o logo com base na primeira condição
    const weatherLogo = document.getElementById('weather-logo');
    if (forecasts.length > 0) {
        weatherLogo.src = getWeatherImage(forecasts[0].weather[0].description);
    }
}

// Função para obter imagem de acordo com a condição do tempo
function getWeatherImage(condition) {
    switch (condition.toLowerCase()) {
        case 'céu limpo':
            return 'sol.png';  // Caminho da imagem para céu limpo
        case 'nublado':
            return 'nublado.png';  // Caminho da imagem para nublado
        case 'chuva fraca':
            return 'chuva_fraca.png';  // Caminho da imagem para chuva fraca
        case 'chuva moderada':
            return 'chuva_moderada.png';  // Caminho da imagem para chuva moderada
        case 'chuva forte':
            return 'chuva_forte.png';  // Caminho da imagem para chuva forte
        default:
            return 'logo.png';  // Imagem padrão
    }
}

// Função para gerar PDF a partir da tabela de dados
function savePdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Consulta Climática", 10, 10);
    doc.text(`Estado: ${document.getElementById('estado').value}`, 10, 20);
    doc.text(`Cidade: ${document.getElementById('cidade').value}`, 10, 30);

    const table = document.getElementById("tabela-clima");
    doc.autoTable({ html: table, startY: 40 });

    doc.save(`Consulta_Clima_${document.getElementById('cidade').value}.pdf`);
}

document.getElementById('gerar-pdf').addEventListener('click', savePdf);
document.getElementById('estado').addEventListener('change', loadCities);
document.getElementById('buscar').addEventListener('click', updateWeatherData);

loadStates();
