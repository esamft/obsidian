import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Testa o endpoint raiz"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "app" in data
    assert "version" in data
    assert "status" in data


def test_health_check():
    """Testa o health check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "config" in data


def test_categories_endpoint():
    """Testa o endpoint de categorias"""
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert len(data["categories"]) > 0
    
    # Verifica se todas as categorias têm os campos obrigatórios
    for category in data["categories"]:
        assert "id" in category
        assert "name" in category
        assert "description" in category
        assert "folder" in category
        assert "icon" in category


def test_process_text_endpoint():
    """Testa o endpoint de processamento de texto"""
    test_data = {
        "text": "Esta é uma nota de teste para verificar o funcionamento do sistema.",
        "category": "inbox",
        "priority": "normal",
        "tags": ["teste", "sistema"]
    }
    
    response = client.post("/api/processing/text", json=test_data)
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "job_id" in data
    assert "status" in data


def test_process_text_validation():
    """Testa validação de entrada do endpoint de processamento"""
    # Teste com texto vazio
    response = client.post("/api/processing/text", json={"text": ""})
    assert response.status_code == 422
    
    # Teste com categoria inválida
    response = client.post("/api/processing/text", json={
        "text": "Texto de teste",
        "category": "categoria_invalida"
    })
    assert response.status_code == 422
    
    # Teste com prioridade inválida
    response = client.post("/api/processing/text", json={
        "text": "Texto de teste",
        "priority": "prioridade_invalida"
    })
    assert response.status_code == 422


def test_job_status_endpoint():
    """Testa o endpoint de status de job"""
    # Primeiro cria um job
    test_data = {
        "text": "Texto para testar status do job",
        "category": "inbox"
    }
    
    create_response = client.post("/api/processing/text", json=test_data)
    assert create_response.status_code == 200
    job_id = create_response.json()["job_id"]
    
    # Agora verifica o status
    status_response = client.get(f"/api/processing/status/{job_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    assert "job_id" in data
    assert "status" in data


def test_jobs_list_endpoint():
    """Testa o endpoint de listagem de jobs"""
    response = client.get("/api/processing/jobs")
    assert response.status_code == 200
    data = response.json()
    assert "jobs" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data


def test_invalid_job_id():
    """Testa comportamento com job ID inválido"""
    response = client.get("/api/processing/status/invalid-job-id")
    assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 