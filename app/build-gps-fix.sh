#!/bin/bash

# Script de Build e Deploy - CORRECRAT
# Com correções GPS implementadas

echo "🚀 Iniciando build do CORRECRAT com correções GPS..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório correcrat/app${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

echo -e "${YELLOW}🔨 Buildando aplicação...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído${NC}"
echo ""

echo -e "${YELLOW}📱 Sincronizando com Capacitor...${NC}"
npx cap sync android

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao sincronizar com Capacitor${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Sincronização concluída${NC}"
echo ""

echo -e "${YELLOW}🔧 Abrindo Android Studio...${NC}"
npx cap open android

echo ""
echo -e "${GREEN}✅ Build completo!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "1. No Android Studio, clique em 'Run' ou pressione Shift+F10"
echo "2. Selecione seu dispositivo físico (não use emulador para GPS)"
echo "3. Aguarde a instalação"
echo "4. Teste em um percurso conhecido"
echo "5. Compare com Strava"
echo ""
echo "📊 Melhorias implementadas:"
echo "  ✓ Filtro de movimento: 3m → 1m"
echo "  ✓ Precisão GPS: 40m → 50m"
echo "  ✓ Interpolação em gaps de sinal"
echo "  ✓ Timeout GPS: 10s → 5s"
echo "  ✓ Permissões otimizadas"
echo ""
echo "📝 Veja GPS_FIXES.md para detalhes completos"
echo "🧪 Veja GPS_TEST_GUIDE.md para guia de testes"
