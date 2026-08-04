
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

// ===================== CPF EXISTENTE E ACEITO  - do chat pq é uma linha de raciocínio que n entendi nem a matemática básica =============

export function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ""); // Remove pontos e traços
    
    if (cpf.length !== 11) return false;    // Deve ter 11 dígitos

    if (/^(\d)\1+$/.test(cpf)) return false;     // Rejeita CPFs com todos os números iguais
 
    // Calcula o 1º dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }
 
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
 
    if (resto !== Number(cpf[9])) return false;
 
    // Calcula o 2º dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }
 
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
 
    if (resto !== Number(cpf[10])) return false;
 
    return true;
}

export function cpfJaCadastrado(cpf) {
    try {
        const resposta = await fetch("http://localhost:3000/verificarCpf", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ cpf })
        });
 
        const dados = await resposta.json();
 
        return dados.cpfExiste;
    } catch (erro) {
        console.error("Erro ao verificar CPF:", erro);
        return false;
    }
}

