// ===================== Colocar Barra======================================================
export function ColocarBarra(data) {
    let v = data.target.value.replace(/\D/g, '').slice(0, 8);
    v = v.replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
    data.target.value = v;
}

// ===================== Conferir Data BR ======================================================
export function conferirDataBR (dataBr){
    const partes = dataBr.split("/"); // cria um array list com as três partes
    const dia = Number (partes[0]);
    const mes = Number (partes[1]);
    const ano = Number (partes[2]);

    if(mes > 0 && mes < 13){ // o mês ser entre 1 e 12
        if(mes  == 2){ // se for fevereiro
            return mes2(dia, ano); //descobre se é bissexto ou não
        }else{  // não for fevereiro
            if(mes == 1 || mes == 3 || mes == 5 || mes == 7 || mes == 8 || mes == 10 || mes == 12){ // conferir se tem 31 dias
                if(dia < 32 && dia > 0){
                    return true;
                }else{
                    return false;
                }
            }else{ // caso n seja um mês que tenha 31 dias
                if(dia < 31 && dia > 0){
                    return true;
                }else{
                    return false;
                        
                }
            }
        }
    } 
    return false;//caso seja menor que 1 ou maior que 12
}

export function mes2(dia, ano) {
    if ((ano % 400 == 0) || (ano % 4 == 0 && ano % 100 != 0)){ // ano bissexto
        if (dia > 0 && dia <= 29) {
            return true;
        } else {
            return false;
        }
    } else { // ano não bissexto
        if (dia > 0 && dia <= 28) {
            return true;
        } else {
            return false;  
        }
    }
}

// =====================  Data BR para a Outra ======================================================
export function TransformarDataBr(data) {
    // converte de DD/MM/AAAA → AAAA-MM-DD
    const partes = data.split("/"); // divide o texto usando /, criando um array list com as parte 
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

// ===================== CPF: 000.000.000-00 ====================================================
export function PontosCPF(cpf){ 
  // e.target = o elemento que disparou o evento (o input do CPF).
  // .value = o texto que está escrito dentro dele agora.
  // .replace(/\D/g, '') = expressão regular:
  //     \D  → "qualquer coisa que NÃO seja dígito" (letra, ponto, traço...)
  //     g   → "global": troca TODAS as ocorrências, não só a primeira.
  //     ''  → substitui por vazio (ou seja, apaga).
  // Resultado: sobra só números puros. Ex.: "123.abc4" vira "1234".
  // .slice(0, 11) = pega no máximo 11 caracteres (CPF tem 11 dígitos).
  let v = cpf.target.value.replace(/\D/g, '').slice(0, 11); //apaga tudo que n for número e garante ter apenas 11 caracteres 

  // Agora inserimos os separadores.
  // (\d{3})(\d)  → captura 3 dígitos (grupo 1) seguidos de 1 dígito (grupo 2).
  // '$1.$2'      → substitui por: grupo1 + ponto + grupo2.
  v = v.replace(/(\d{3})(\d)/, '$1.$2')

       .replace(/(\d{3})(\d)/, '$1.$2')

       .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  // Devolve o texto formatado para o campo.
  cpf.target.value = v;
}

// ===================== CEP: 00000-000 =========================================================
export function PontosCEP(cep){ 
  let v = cep.target.value.replace(/\D/g, '').slice(0, 8);
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  cep.target.value = v;
}

//============================ SENHA =======================================
export function SenhaVisivel(campoSenha, btnCadeado) { 
    if (!campoSenha || !btnCadeado) return;     // Garante que o botão e o campo foram encontrados antes de continuar

    // Procura o ícone dentro do botão passado
    const icone = btnCadeado.querySelector(".material-symbols-outlined");

    if (!icone) return; // Segurança caso o ícone não exista

    btnCadeado.addEventListener("click", () => {
       const estaOculta = campoSenha.type === "password";
        
        if (estaOculta) {
            campoSenha.type = "text";
            icone.textContent = "lock_open"; 
        } else {
            campoSenha.type = "password";
            icone.textContent = "lock";    
        }
        
        // Mantém o foco no campo para o usuário continuar digitando se quiser
        campoSenha.focus();
    });
}

//============================ Conferir CPF e Email =======================================
export async function conferirCpfEmail(cpf, email) {
    try {
        if (!validarCPF(cpf)) {
            alert("CPF inválido!");
            return false;
        }
        // Envia CPF e e-mail para o servidor verificar se já existem cadastrados no banco
        const respostaVerificacao = await fetch("http://localhost:3000/verificarCadastroAluno",{
            method: "POST",
            headers: {"Content-Type": "application/json"}, // Informa que os dados enviados serão em JSON
            body: JSON.stringify({
                cpf: cpf,
                email: email
            })
        });
        const dadosVerificacao = await respostaVerificacao.json(); // resposta do servidor

        if (dadosVerificacao.cpfExiste) {
            alert("CPF já cadastrado!");
            return false;
        }
        if (dadosVerificacao.emailExiste) {
            alert("E-mail já cadastrado!");
            return false;
        }
        return true;
    }
    catch(erro){
        console.error(erro);
        alert("Erro ao verificar CPF e e-mail");
        return false;
    }
}

export async function conferirCpfEmailProf(cpf, email) {
    try {
        if (!validarCPF(cpf)) {
            alert("CPF inválido!");
            return false;
        }

        // Envia CPF e e-mail para o servidor verificar se já existem cadastrados no banco
        const respostaVerificacao = await fetch("http://localhost:3000/verificarCadastroProf",{
            method: "POST",
            headers: {"Content-Type": "application/json"}, // Informa que os dados enviados serão em JSON
            body: JSON.stringify({
                cpf: cpf,
                email: email
            })
        });
        const dadosVerificacao = await respostaVerificacao.json(); // resposta do servidor

        if (dadosVerificacao.cpfExiste) {
            alert("CPF já cadastrado!");
            return false;
        }
        if (dadosVerificacao.emailExiste) {
            alert("E-mail já cadastrado!");
            return false;
        }
        return true;
    }
    catch(erro){
        console.error(erro);
        alert("Erro ao verificar CPF e e-mail");
        return false;
    }
}

//============================ Validar CPF =======================================
export function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ""); // Remove qualquer caractere que não seja número

    if (cpf.length !== 11) { // Verifica se o CPF possui exatamente 11 dígitos
        return false;
    }

    if (/^(\d)\1{10}$/.test(cpf)) { // Verifica se todos os dígitos são iguais (ex: 11111111111)
        return false;
    }

    let soma = 0; // Variável que armazenará a soma dos cálculos

    for (let i = 0; i < 9; i++) { // Percorre os 9 primeiros dígitos do CPF
        // Multiplica cada dígito pelo peso correspondente - Pesos: 10, 9, 8, ..., 2
        soma += parseInt(cpf[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;  // Calcula o primeiro dígito verificador
    if (resto === 10) resto = 0; // Se o resultado for 10, o dígito vira 0
    if (resto !== parseInt(cpf[9])) { // Compara o dígito calculado com o 10º dígito do CPF
        return false;
    }

    soma = 0; // Reinicia a soma para calcular o segundo dígito

    for (let i = 0; i < 10; i++) {
        // Pesos: 11, 10, 9, ..., 2
        soma += parseInt(cpf[i]) * (11 - i);
    }

    resto = (soma * 10) % 11;     // Calcula o segundo dígito verificador
    if (resto === 10) resto = 0; // Se o resultado for 10, o dígito vira 0

    if (resto !== parseInt(cpf[10])) { // Compara o dígito calculado com o último dígito do CPF
        return false;
    }

    // Se passou por todas as verificações, o CPF é válido
    return true;
}

