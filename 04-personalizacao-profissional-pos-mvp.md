# 🎨 Personalização da Página do Profissional (Pós-MVP)

## 🎯 Objetivo
Permitir que profissionais personalizem sua página dentro da plataforma,
reforçando identidade visual e criando diferenciação, sem comprometer
segurança, performance ou manutenção do sistema.

---

## 🧠 Conceito Central
A personalização será baseada exclusivamente em **configurações controladas**,
não permitindo alterações diretas de código (HTML/CSS/JS).

---

## 🏷️ Planos

### 🔹 Plano Free
- Cor de fundo (paleta limitada)
- Cor principal (botões e destaques)
- Marca d’água da plataforma visível

### 🔹 Plano Premium
- Cor de fundo livre
- Cor principal livre
- Cor de texto
- Imagem de fundo
- Remoção da marca d’água

---

## 📦 Estrutura de Dados

```json
theme_config: {
  plan: "free",
  colors: {
    background: "#ffffff",
    primary: "#e91e63",
    text: "#333333"
  },
  background: {
    type: "color",
    image_url: null
  }
}
