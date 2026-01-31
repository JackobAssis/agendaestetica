#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# Test Runner Script for AgendaEstética
# ==========================================
# Este script executa os testes automatizados
# usando o Firebase Emulator Suite
# ==========================================

echo "🧪 AgendaEstética - Test Runner"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Set environment variables
export FIRESTORE_EMULATOR_HOST=${FIRESTORE_EMULATOR_HOST:-localhost:8080}
export FIREBASE_AUTH_EMULATOR_HOST=${FIREBASE_AUTH_EMULATOR_HOST:-localhost:9099}
export GCLOUD_PROJECT=${GCLOUD_PROJECT:-demo-project}

# Function to check if emulators are running
check_emulators() {
    echo "📡 Verificando emuladores..."
    
    if curl -s "http://${FIRESTORE_EMULATOR_HOST}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Firestore Emulator está rodando em ${FIRESTORE_EMULATOR_HOST}${NC}"
    else
        echo -e "${RED}✗ Firestore Emulator não está rodando!${NC}"
        echo -e "${YELLOW}Inicie os emuladores com: firebase emulators:start${NC}"
        exit 1
    fi
    
    if curl -s "http://${FIREBASE_AUTH_EMULATOR_HOST}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Auth Emulator está rodando em ${FIREBASE_AUTH_EMULATOR_HOST}${NC}"
    else
        echo -e "${YELLOW}⚠ Auth Emulator não está rodando (alguns testes podem falhar)${NC}"
    fi
}

# Function to run tests
run_tests() {
    local test_suite=${1:-all}
    
    echo ""
    echo "🚀 Executando testes: ${test_suite}"
    echo "--------------------------------"
    
    case $test_suite in
        auth)
            npm run test:auth
            ;;
        agenda)
            npm run test:agenda
            ;;
        agendamentos)
            npm run test:agendamentos
            ;;
        all|"")
            npm run test:all
            ;;
        *)
            echo -e "${RED}Suite de teste desconhecido: ${test_suite}${NC}"
            echo "Opções: auth, agenda, agendamentos, all"
            exit 1
            ;;
    esac
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Todos os testes passaram!${NC}"
    else
        echo ""
        echo -e "${RED}✗ Alguns testes falharam (código: ${exit_code})${NC}"
    fi
    
    return $exit_code
}

# Function to show test coverage
show_help() {
    echo ""
    echo "用法 (Usage):"
    echo "  $0              # Executar todos os testes"
    echo "  $0 auth         # Executar testes de autenticação"
    echo "  $0 agenda       # Executar testes de agenda"
    echo "  $0 agendamentos # Executar testes de agendamentos"
    echo "  $0 check        # Verificar se emuladores estão rodando"
    echo "  $0 help         # Mostrar esta ajuda"
    echo ""
    echo "Variáveis de ambiente:"
    echo "  FIRESTORE_EMULATOR_HOST=${FIRESTORE_EMULATOR_HOST}"
    echo "  FIREBASE_AUTH_EMULATOR_HOST=${FIREBASE_AUTH_EMULATOR_HOST}"
    echo "  GCLOUD_PROJECT=${GCLOUD_PROJECT}"
    echo ""
}

# Main execution
case "${1:-all}" in
    help|-h|--help)
        show_help
        exit 0
        ;;
    check)
        check_emulators
        exit 0
        ;;
    *)
        check_emulators
        run_tests "${1:-all}"
        exit $?
        ;;
esac

