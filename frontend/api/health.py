"""
Vercel Serverless Function para health check
"""
from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Health check endpoint"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        api_key = os.getenv('OPENAI_API_KEY', '')
        api_configured = bool(api_key and api_key != 'your-openai-api-key-here')
        
        response = {
            'status': 'healthy' if api_configured else 'needs_configuration',
            'vault_configured': True,  # Simplificado para Vercel
            'vault_path': '/tmp/vault',
            'api_configured': api_configured,
            'platform': 'vercel'
        }
        
        self.wfile.write(json.dumps(response).encode('utf-8'))