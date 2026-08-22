# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Site oficial da ATTA — marca de activewear/fitness feminino.

**Objetivo inicial:** site-catálogo visual e responsivo, sem checkout, pagamento, login ou backend. Apresenta marca, coleções e produtos. Pode evoluir no futuro.

**Status atual:** projeto ainda não iniciado (sem código-fonte). Não é repositório git.

## Tecnologia

React + Vite + TypeScript + Tailwind CSS. Preparar para GitHub e GitHub Pages.

## Dados de produto

Estrutura de dados centralizada (ex.: `src/data/products.ts`) para peças, coleções, cores, tamanhos, preços e imagens — inclusão de itens não deve exigir alterar várias páginas.

Categorias iniciais: leggings, shorts, tops, croppeds, macacões, jaquetas.

## Direção visual

Premium, fashion/editorial, minimalista, forte, feminina sem clichês, sensação de movimento, fotografia em grande destaque, tipografia marcante, bastante espaço visual, animações e transições sutis.

**Referências** (estudar linguagem visual, hierarquia, fotografia, navegação, movimento e apresentação de coleções — nunca copiar layout, identidade, textos ou elementos proprietários):
- https://www.aloyoga.com.br/
- https://www.nike.com.br/sc/treino

**Evitar:** template genérico de e-commerce, estética de site gerado por IA, rosa/pastel clichê, excesso de cards e bordas arredondadas, excesso de texto, banners promocionais genéricos, aparência de marketplace.

## Regras de trabalho

- código simples, reutilizável e fácil de manter
- não adicionar bibliotecas desnecessárias
- não implementar funcionalidades não solicitadas
- antes de mudanças grandes, apresentar proposta curta
- explicações objetivas, sem análises longas desnecessárias
- não reanalisar arquivos sem necessidade
- agrupar operações relacionadas quando reduzir trabalho/contexto
- sempre verificar o build antes de considerar algo concluído

## Economia de tokens

- priorizar o menor uso possível de tokens
- respostas diretas, frases curtas, sem preenchimento
- não narrar ações, não repetir o pedido, não explicar o óbvio
- sem resumos extensos nem documentação desnecessária
- não reanalisar arquivos já compreendidos nem ler arquivos desnecessários
- não descrever código já visível
- não propor alternativas não solicitadas
- agrupar operações relacionadas
- perguntar só quando realmente bloqueado
- ao final de uma tarefa, informar apenas: resultado, build/testes, erros relevantes
- nunca sacrificar qualidade ou funcionamento do código para economizar tokens
