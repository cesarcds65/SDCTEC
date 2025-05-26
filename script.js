// Variáveis globais
    let velocidadeFala = 1.0;
    let nomeUsuario = '';
    let progressoUsuario = {
      aulas_concluidas: 0,
      ultimo_acesso: new Date().toISOString()
    };
    let fontSizeLevel = 0; // Nível de tamanho da fonte (0 = normal, positivo = maior, negativo = menor)
    let voiceControlActive = false;
    let recognition = null;
    
    // Banco de dados simulado
    const bancoDeDados = {
      usuarios: [],
      preferencias: [],
      navegacao: [],
      progresso: []
    };
    
    // Funções de acessibilidade
    function toggleAccessibilityMenu() {
      const menu = document.getElementById('accessibilityMenu');
      menu.classList.toggle('show');
    }
    
    function changeFontSize(action) {
      if (action === 'increase') {
        fontSizeLevel++;
      } else if (action === 'decrease') {
        fontSizeLevel--;
      }
      
      // Limita o nível de tamanho da fonte entre -3 e 5
      fontSizeLevel = Math.max(-3, Math.min(5, fontSizeLevel));
      
      // Aplica o tamanho da fonte a todos os elementos relevantes
      applyFontSize();
      
      // Salva a preferência do usuário
      if (nomeUsuario) {
        salvarPreferenciasUsuario();
      }
    }
    
    function applyFontSize() {
      // Calcula o fator de escala com base no nível de tamanho da fonte
      const scaleFactor = 1 + (fontSizeLevel * 0.1);
      
      // Aplica o tamanho da fonte aos elementos relevantes
      document.documentElement.style.setProperty('--font-scale', scaleFactor);
      
      // Ajusta os tamanhos de fonte específicos
      document.querySelectorAll('p, button, label, input, .concept-code').forEach(el => {
        el.style.fontSize = `${1.1 * scaleFactor}rem`;
      });
      
      document.querySelectorAll('.welcome-text').forEach(el => {
        el.style.fontSize = `${1.8 * scaleFactor}rem`;
      });
      
      document.querySelectorAll('h2').forEach(el => {
        el.style.fontSize = `${2 * scaleFactor}rem`;
      });
      
      document.querySelectorAll('h1, .logo').forEach(el => {
        el.style.fontSize = `${3.5 * scaleFactor}rem`;
      });
      
      // Atualiza o status
      const status = document.getElementById('voiceControlStatus');
      if (status) {
        status.textContent = `Tamanho do texto: ${fontSizeLevel > 0 ? '+' : ''}${fontSizeLevel}`;
      }
    }
    
    // Controle por voz
    function toggleVoiceControl() {
      if (!voiceControlActive) {
        startVoiceControl();
      } else {
        stopVoiceControl();
      }
    }
    
    function startVoiceControl() {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.');
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onstart = function() {
        voiceControlActive = true;
        document.getElementById('voiceControlText').textContent = 'Desativar controle por voz';
        document.getElementById('voiceControlStatus').textContent = 'Ouvindo comandos de voz...';
      };
      
      recognition.onresult = function(event) {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        
        document.getElementById('voiceControlStatus').textContent = `Comando reconhecido: "${command}"`;
        
        // Processa o comando de voz
        processVoiceCommand(command);
      };
      
      recognition.onerror = function(event) {
        console.error('Erro no reconhecimento de voz:', event.error);
        document.getElementById('voiceControlStatus').textContent = `Erro: ${event.error}`;
      };
      
      recognition.onend = function() {
        // Reinicia o reconhecimento se ainda estiver ativo
        if (voiceControlActive) {
          recognition.start();
        }
      };
      
      recognition.start();
    }
    
    function stopVoiceControl() {
      if (recognition) {
        recognition.stop();
        voiceControlActive = false;
        document.getElementById('voiceControlText').textContent = 'Ativar controle por voz';
        document.getElementById('voiceControlStatus').textContent = 'Controle por voz desativado';
      }
    }
    
    function processVoiceCommand(command) {
      // Comandos para ajustar o tamanho do texto
      if (command.includes('aumentar') && (command.includes('texto') || command.includes('fonte') || command.includes('tamanho'))) {
        changeFontSize('increase');
        lerTexto('Tamanho do texto aumentado');
      } 
      else if (command.includes('diminuir') && (command.includes('texto') || command.includes('fonte') || command.includes('tamanho'))) {
        changeFontSize('decrease');
        lerTexto('Tamanho do texto diminuído');
      }
      // Comandos de navegação
      else if (command.includes('voltar')) {
        window.history.back();
        lerTexto('Voltando para a tela anterior');
      }
      else if (command.includes('iniciar cadastro') || command.includes('cadastrar')) {
        irPara('tela2');
        lerTexto('Indo para a tela de cadastro');
      }
      else if (command.includes('continuar')) {
        if (document.getElementById('tela3').classList.contains('active')) {
          irPara('tela4');
          lerTexto('Indo para a próxima tela');
        }
      }
      else if (command.includes('desenvolver') || command.includes('programar') || command.includes('codificar')) {
        irPara('telaDesenvolver');
        lerTexto('Abrindo ambiente de desenvolvimento HTML');
      }
      else if (command.includes('o que é') || command.includes('sobre')) {
        mostrarInfo();
      }
      else if (command.includes('ler') || command.includes('leitura')) {
        lerTexto();
      }
      // Comandos para o ambiente de desenvolvimento
      else if (document.getElementById('telaDesenvolver').classList.contains('active')) {
        if (command.includes('testar') || command.includes('executar')) {
          testarCodigo();
          lerTexto('Testando seu código');
        }
        else if (command.includes('visualizar') || command.includes('mostrar')) {
          togglePreview();
          lerTexto('Alternando visualização');
        }
        else if (command.includes('salvar')) {
          salvarArquivo();
          lerTexto('Salvando arquivo');
        }
        else if (command.includes('abrir') || command.includes('carregar')) {
          abrirArquivo();
          lerTexto('Abrindo arquivo');
        }
        else if (command.includes('novo') || command.includes('limpar')) {
          novoArquivo();
          lerTexto('Criando novo arquivo');
        }
        else if (command.includes('ajuda') || command.includes('dica')) {
          ajudaHTML();
          lerTexto('Mostrando ajuda');
        }
        else if (command.includes('menu')) {
          toggleDevMenu();
          lerTexto('Abrindo menu');
        }
      }
    }
    
    // API de síntese de voz mais intuitiva
    function lerTexto(texto) {
      if (!texto) {
        texto = "Bem-vindo ao VOZETA! Uma plataforma feita para você aprender programação de forma acessível, guiada por voz e adaptada às suas necessidades.";
      }
      
      // Verifica se a API de fala está disponível
      if ('speechSynthesis' in window) {
        // Cancela qualquer fala anterior
        window.speechSynthesis.cancel();
        
        const fala = new SpeechSynthesisUtterance(texto);
        fala.lang = 'pt-BR';
        fala.rate = velocidadeFala;
        fala.pitch = 1.0;
        fala.volume = 1.0;
        
        // Tenta encontrar uma voz em português
        const vozes = window.speechSynthesis.getVoices();
        const vozPT = vozes.find(voz => voz.lang.includes('pt'));
        if (vozPT) fala.voice = vozPT;
        
        window.speechSynthesis.speak(fala);
      } else {
        console.log("API de síntese de voz não suportada neste navegador.");
        alert("Seu navegador não suporta leitura em voz alta.");
      }
    }

    // Ajuste de velocidade da fala
    function ajustarVelocidade(valor) {
      velocidadeFala = parseFloat(valor);
      // Atualiza o valor no banco de dados
      salvarPreferenciasUsuario();
    }

    // Ajuste de contraste
    function ajustarContraste(valor) {
      const intensidade = parseInt(valor);
      // Ajusta a cor de fundo com base no valor do contraste
      document.documentElement.style.setProperty('--bg-color', `rgb(0, ${Math.min(77, intensidade/2)}, ${Math.min(64, intensidade/2)})`);
      // Atualiza o valor no banco de dados
      salvarPreferenciasUsuario();
    }

    // Navegação entre telas
    function irPara(telaId) {
      // Esconde todas as telas
      document.querySelectorAll('.container').forEach(div => div.classList.remove('active'));
      // Mostra a tela selecionada
      document.getElementById(telaId).classList.add('active');
      
      // Ações específicas para cada tela
      if (telaId === 'tela3' && nomeUsuario) {
        const mensagem = document.querySelector('#tela3 .speech-box p');
        mensagem.textContent = `Olá ${nomeUsuario}! Vamos começar com os conceitos básicos de HTML, CSS e JavaScript.`;
        lerTexto(mensagem.textContent);
      }
      
      // Adiciona ao histórico do navegador para permitir voltar
      if (telaId !== 'tela1') {
        history.pushState({telaId: telaId}, '', `#${telaId}`);
      }
      
      // Registra a navegação no banco de dados
      registrarNavegacao(telaId);
    }
    
    // Manipulador de evento para o botão voltar do navegador
    window.addEventListener('popstate', function(event) {
      if (event.state && event.state.telaId) {
        irPara(event.state.telaId);
      } else {
        irPara('tela1');
      }
    });

    // Validação do formulário da tela 2
    function validarEAvancar() {
      const nome = document.getElementById('nome').value.trim();
      if (nome === '') {
        alert('Por favor, informe seu nome para continuar.');
        document.getElementById('nome').focus();
        return;
      }
      
      // Verifica se o nome já existe no banco de dados
      if (verificarNomeExistente(nome)) {
        alert('Este nome de usuário já está cadastrado. Por favor, escolha outro nome.');
        document.getElementById('nome').focus();
        return;
      }
      
      // Salva o nome do usuário
      nomeUsuario = nome;
      
      // Salva os dados no banco de dados
      salvarDadosUsuario();
      
      // Avança para a próxima tela
      irPara('tela3');
    }
    
    // Verifica se o nome já existe no banco de dados
    function verificarNomeExistente(nome) {
      return bancoDeDados.usuarios.some(usuario => usuario.nome.toLowerCase() === nome.toLowerCase());
    }

    // Mostrar informações sobre o VOZETA
    function mostrarInfo() {
      alert('O VOZETA é uma plataforma de ensino de programação acessível com comandos por voz, focada em HTML, CSS e JavaScript.');
    }

    // Voltar para a tela 3
    function voltarParaTela3() {
      irPara('tela3');
    }

    // Funções para o ambiente de desenvolvimento
    function toggleDevMenu() {
      const menu = document.getElementById('devMenu');
      menu.classList.toggle('show');
    }
    
    function testarCodigo() {
      const codigo = document.getElementById('htmlEditor').value;
      const preview = document.getElementById('previewFrame');
      const previewContainer = document.getElementById('previewContainer');
      
      // Mostra o container de preview
      previewContainer.classList.add('show');
      
      // Atualiza o conteúdo do iframe
      const previewDoc = preview.contentDocument || preview.contentWindow.document;
      previewDoc.open();
      previewDoc.write(codigo);
      previewDoc.close();
      
      // Feedback ao usuário
      lerTexto('Código em execução');
    }
    
    function togglePreview() {
      const previewContainer = document.getElementById('previewContainer');
      previewContainer.classList.toggle('show');
      
      if (previewContainer.classList.contains('show')) {
        testarCodigo();
      }
    }
    
    function novoArquivo() {
      if (confirm('Deseja criar um novo arquivo? O conteúdo atual será perdido.')) {
        document.getElementById('htmlEditor').value = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minha Página HTML</title>
  <style>
    /* Adicione seu CSS aqui */
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }
  </style>
</head>
<body>
  <!-- Adicione seu conteúdo aqui -->
  <h1>Minha Primeira Página HTML</h1>
  <p>Este é um parágrafo de exemplo.</p>
  
  <script>
    // Adicione seu JavaScript aqui
    console.log("Olá, mundo!");
