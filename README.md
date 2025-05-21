# NFC PayFlow

Aplicativo de pagamentos via NFC com fluxo completo de compartilhamento de cobranças.

## Funcionalidades

- Criar cobranças como vendedor
- Compartilhar cobranças via QR Code ou link
- Receber cobranças como cliente
- Processamento de pagamentos via NFC
- Histórico de pagamentos e cobranças

## Fluxo de Compartilhamento de Cobranças

### Para o Vendedor (emissor da cobrança)

1. Acesse a seção do emissor da cobrança
2. Crie uma nova cobrança preenchendo os dados:
   - Valor
   - Descrição
   - Nome do cliente (opcional)
   - Nome da empresa/comerciante
3. Após criar a cobrança, você terá acesso à tela de compartilhamento com:
   - QR Code para escaneamento
   - Link de pagamento para compartilhar
   - Código da cobrança para referência

### Para o Cliente (receptor da cobrança)

1. Acesse a cobrança através de uma das opções:
   - Escaneie o QR code
   - Clique no link compartilhado
   - Insira o código manualmente na tela de pagamentos
2. Confira os detalhes da cobrança:
   - Valor
   - Descrição
   - Nome do comerciante
   - ID da transação
3. Selecione o método de pagamento "Cartão via NFC"
4. Aproxime o cartão do dispositivo para concluir o pagamento
5. Receba a confirmação do pagamento realizado

## Implementação Técnica

Este projeto utiliza:

- React Native com Expo
- Firebase Realtime Database para armazenamento das cobranças
- Deep Links para facilitar o compartilhamento de cobranças
- Simulação de pagamento via NFC (sem verificação real do hardware)

### Estrutura de Dados no Firebase

- `/charges/[id]` - Armazena os dados da cobrança
- `/tokens/[token]` - Armazena a referência para a cobrança pelo token
- `/payments/[id]` - Armazena os dados do pagamento realizado

### Configurações Importantes

- Para o funcionamento correto dos deep links, certifique-se que o arquivo `app.json` está configurado corretamente
- O arquivo `google-services.json` deve estar presente na raiz do projeto e no diretório `android/app/`

## Desenvolvimento

Para executar o projeto:

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start

# Para iniciar o app diretamente no Android
npm run android

# Para iniciar o app diretamente no iOS (apenas macOS)
npm run ios
```

## Estrutura do Projeto

- `/app/(sender)` - Telas para o emissor da cobrança
- `/app/(receiver)` - Telas para o receptor da cobrança
- `/app/payment` - Telas relacionadas ao processo de pagamento
- `/app/pay/[token]` - Rota para deep link de pagamento
- `/services` - Serviços de integração com o Firebase

## Visão Geral

O NFC PayFlow é uma solução inovadora de pagamentos que inverte o fluxo tradicional do NFC tap-to-pay. Em vez do cobrador ter o terminal e o cliente aproximar o cartão/celular, nosso sistema permite que:

1. O cobrador gere uma cobrança remotamente
2. O devedor receba esta cobrança
3. O celular do devedor se torne um terminal para o cobrador 
4. O devedor aproxime seu próprio cartão em seu próprio celular
5. O pagamento seja processado para a conta do cobrador

## Conceito

### Problema
Os sistemas de pagamento atuais exigem que o cobrador tenha um terminal físico (maquininha) para receber pagamentos com cartão, o que limita a mobilidade e aumenta custos.

### Solução
Transformamos o celular do cliente em um terminal temporário que processa pagamentos para a conta do cobrador, não do dono do celular. Isso elimina a necessidade de equipamentos adicionais e permite cobranças remotas.

## Arquitetura do Sistema

### Componentes Principais

1. **App do Cobrador**:
   - Interface para criar cobranças
   - Geração de tokens de pagamento
   - Dashboard de transações

2. **App do Devedor**:
   - Recebimento de cobranças
   - Emulação de terminal NFC
   - Processamento de pagamentos para terceiros

3. **Backend**:
   - Autenticação e gerenciamento de usuários
   - Validação de tokens
   - Processamento seguro de transações
   - Integração com processadoras de pagamento

### Fluxo de Pagamento

```
+-------------------+      +-------------------+      +-------------------+
|   App Cobrador    |      |   App Devedor     |      |   Servidor        |
+-------------------+      +-------------------+      +-------------------+
         |                          |                          |
         |  1. Cria cobrança        |                          |
         |------------------------->|                          |
         |                          |                          |
         |  2. Envia dados cobrador |                          |
         |     (tokenizados)        |                          |
         |------------------------->|                          |
         |                          |                          |
         |                          |  3. Valida token         |
         |                          |------------------------->|
         |                          |                          |
         |                          |  4. Token válido + dados |
         |                          |<-------------------------|
         |                          |                          |
         |                          |  5. Emula terminal com   |
         |                          |     dados do COBRADOR    |
         |                          |                          |
         |                          |  6. Aproxima cartão      |
         |                          |     no próprio celular   |
         |                          |                          |
         |                          |  7. Processa pagamento   |
         |                          |     para conta do        |
         |                          |     COBRADOR             |
         |                          |------------------------->|
         |                          |                          |
         |  9. Notifica sucesso     |  8. Confirma transação   |
         |<-------------------------|<-------------------------|
         |                          |                          |
```

## Tecnologias Principais

- **Frontend**: React Native/Expo
- **NFC**: APIs nativas do Android/iOS para NFC
- **Backend**: Firebase/Node.js
- **Segurança**: Tokenização, criptografia de ponta a ponta
- **Pagamentos**: Integração com processadoras de pagamento

## Detalhes de Implementação

### Tokenização Segura

O sistema utiliza tokens temporários para cada transação, que:
- Contêm dados do cobrador de forma criptografada
- Possuem tempo de expiração limitado (15 minutos)
- São validados pelo servidor antes do processamento
- Incluem assinatura digital para verificação de integridade

#### Estrutura do Token

```typescript
{
  tokenId: "string",         // ID único do token
  timestamp: number,         // Momento de criação
  expiresAt: number,         // Momento de expiração
  signature: "string",       // Assinatura para validação
  
  // Dados do cobrador (criptografados)
  merchantData: {
    id: "string",
    name: "string",
    document: "string",
    accountId: "string",
    merchantKey: "string"
  },
  
  // Dados da transação
  transactionData: {
    id: "string",
    amount: number,
    description: "string",
    timestamp: number,
    currency: "string"
  }
}
```

### Emulação de Terminal

O celular do devedor emula um terminal NFC através de:
- Host Card Emulation (HCE) modificado
- Configuração para processar para conta de terceiros
- Direcionamento seguro do pagamento para o cobrador

### Segurança

- Criptografia de ponta a ponta
- Autenticação em múltiplas camadas
- Validação de tokens pelo servidor
- Sem armazenamento de dados sensíveis do cartão

## Casos de Uso

1. **Vendedores Autônomos**: Profissionais que trabalham em campo podem enviar cobranças remotamente
2. **Divisão de Contas**: Amigos podem dividir contas de restaurante, permitindo pagamento com cartão entre pessoas
3. **Pequenos Comerciantes**: Microempreendedores podem receber pagamentos sem investir em máquinas de cartão
4. **Cobranças Remotas**: Empresas podem enviar cobranças que clientes pagam com seus próprios cartões

## Progresso Atual (Teste de Conceito)

- [x] Configuração do ambiente React Native com Expo
- [x] Implementação do módulo nativo NFC para Android
- [x] Leitura de cartões via NFC
- [x] Interface básica de usuário
- [x] Sistema de tokenização segura
- [x] Fluxo de pagamento entre cobrador e pagador
- [ ] Comunicação segura com backend
- [ ] Integração com processadoras de pagamento
- [ ] Testes de segurança completos
- [ ] Lançamento controlado

## Próximas Etapas

1. **Melhorias de Segurança**:
   - Implementar criptografia completa dos dados do cobrador
   - Adicionar verificação de assinatura no backend
   - Implementar validação de certificados

2. **Integrações**:
   - Conectar com APIs de processadoras de pagamento
   - Implementar autenticação OAuth para cobradores
   - Criar API para gestão de pagamentos

3. **Experiência do Usuário**:
   - Otimizar fluxo de pagamento
   - Adicionar notificações em tempo real
   - Implementar histórico de transações

## Nota sobre Regulamentação

O sistema requer conformidade com:
- Regulamentações do Banco Central
- Certificações PCI DSS
- Legislação de proteção de dados (LGPD)
- Acordos com bandeiras de cartão

---

*Este documento serve como guia de referência para o desenvolvimento do NFC PayFlow e é atualizado conforme o projeto evolui.* 
