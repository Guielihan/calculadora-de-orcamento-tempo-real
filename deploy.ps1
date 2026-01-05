$workspacePath = "C:\Users\David Muniz\OneDrive\Imagens\Projetos Guilherme\GoDevs\Calculadora de Orçamento em Tempo Real"

Set-Location $workspacePath

# inicializar repositório git se não existir
if (-not (Test-Path ".git")) {
    git init
}

# adicionar remote se não existir
$remoteUrl = "https://github.com/Guielihan/calculadora-de-orcamento-tempo-real.git"
$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin $remoteUrl
} elseif ($existingRemote -ne $remoteUrl) {
    git remote set-url origin $remoteUrl
}

# adicionar arquivos do projeto
git add index.html script.js style.css TEST_PLAN.md .gitignore

# fazer commit
git commit -m "Initial commit: Calculadora de Orçamento em Tempo Real"

# fazer push para o github
git branch -M main
git push -u origin main

Write-Host "Deploy concluído com sucesso!"