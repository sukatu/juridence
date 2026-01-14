# Local LLM Setup Guide

This application uses a locally hosted LLM (Large Language Model) to generate case summaries and outcomes without requiring internet access or external API calls.

## Supported Local LLM Solutions

### Option 1: Ollama (Recommended)

Ollama is the easiest way to run LLMs locally.

#### Installation

1. **Install Ollama:**
   - macOS: `brew install ollama` or download from https://ollama.ai
   - Linux: `curl -fsSL https://ollama.ai/install.sh | sh`
   - Windows: Download from https://ollama.ai

2. **Pull a Legal/General Model:**
   ```bash
   # Recommended models for legal text:
   ollama pull llama3.1        # Good general model
   ollama pull mistral         # Fast and efficient
   ollama pull llama3.1:8b     # Smaller, faster version
   ollama pull codellama       # Good for structured text
   ```

3. **Start Ollama:**
   ```bash
   ollama serve
   ```
   This starts Ollama on `http://localhost:11434` (default)

#### Configuration

The service automatically detects Ollama if it's running on the default port. You can configure it via:

**Environment Variables:**
```bash
export LOCAL_LLM_BASE_URL="http://localhost:11434"
export LOCAL_LLM_MODEL="llama3.1"
```

**Or via Database Settings:**
- `local_llm_base_url`: Base URL for Ollama (default: `http://localhost:11434`)
- `local_llm_model`: Model name to use (default: `llama3.1`)

### Option 2: OpenAI-Compatible Local Server

If you're using vLLM, text-generation-webui, or similar:

1. **Start your local server** (usually on port 8000 or 5000)

2. **Configure the service:**
   ```bash
   export LOCAL_LLM_BASE_URL="http://localhost:8000"
   export LOCAL_LLM_MODEL="your-model-name"
   ```

## API Endpoints

### Generate Case Summary
```
POST /api/case-summarization/{case_id}/summarize
```

Generates both summary and outcome for a case.

**Response:**
```json
{
  "case_id": 123,
  "summary": "AI-generated comprehensive case summary...",
  "outcome": "AI-generated outcome statement...",
  "success": true
}
```

### Get Case Summary
```
GET /api/case-summarization/{case_id}/summary
```

Gets existing summary from metadata or generates a new one if not available.

## How It Works

1. When a case is viewed, the frontend calls `/api/case-summarization/{case_id}/summary`
2. The backend checks if a summary exists in the case metadata
3. If not, it uses the local LLM service to:
   - Generate a comprehensive case summary
   - Extract and clarify the case outcome/decision
4. Results are returned to the frontend and displayed in the Case Details page

## Fallback Behavior

If the local LLM is unavailable:
- The service returns a basic summary constructed from available case data
- The outcome uses the `decision` or `judgement` field from the database
- An error message is logged but the page still displays available information

## Testing

To test if Ollama is working:

```bash
curl http://localhost:11434/api/tags
```

You should see a list of available models.

To test the summarization endpoint:

```bash
curl -X POST http://localhost:8000/api/case-summarization/123/summarize
```

## Troubleshooting

1. **"Local LLM unavailable" error:**
   - Ensure Ollama is running: `ollama serve`
   - Check the base URL matches your Ollama installation
   - Verify the model name is correct: `ollama list`

2. **Slow generation:**
   - Use a smaller model (e.g., `llama3.1:8b` instead of `llama3.1`)
   - Ensure you have enough RAM (models need 4-16GB depending on size)
   - Consider using GPU acceleration if available

3. **Connection errors:**
   - Check firewall settings
   - Verify the port (default 11434 for Ollama)
   - Ensure the service can reach localhost

## Performance Tips

- **Model Selection:** Smaller models (7B-8B parameters) are faster and use less memory
- **Caching:** Summaries are stored in case metadata to avoid regeneration
- **Timeout:** Default timeout is 120 seconds; adjust if needed for slower models
