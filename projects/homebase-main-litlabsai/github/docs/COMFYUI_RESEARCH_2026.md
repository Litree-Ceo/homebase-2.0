# ComfyUI + JetBrains Integration Notes (2026)

## Key Points
- ComfyUI is an open-source, node-based UI for Stable Diffusion; install via Git clone + Python venv or desktop installer.
- No native JetBrains plugin; treat ComfyUI as a Python project (PyCharm) for editing and debugging.
- Python 3.10+ required; NVIDIA GPU improves performance.
- For Azure integration, store models/outputs in Blob Storage.

## Adding ComfyUI to Windows 11
Recommended method for developers:
1. `git clone https://github.com/comfyanonymous/ComfyUI.git`
2. `cd ComfyUI`
3. `python -m venv venv`
4. `.\venv\Scripts\activate`
5. `pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121`
6. `pip install -r requirements.txt`
7. `python main.py`

PowerShell helper:
```powershell
# install-comfyui.ps1
git clone https://github.com/comfyanonymous/ComfyUI.git C:\ComfyUI
cd C:\ComfyUI
python -m venv venv
.\venv\Scripts\activate
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
python main.py
```

| Method | Setup Time | Customization | GPU Support | Best For |
|---|---|---|---|---|
| Git Clone | 10-20 min | High | Manual | Devs/custom nodes |
| Desktop Installer | 5 min | Medium | Auto | Fast setup |
| Portable ZIP | 5-10 min | Low | Pre-configured | Portable use |

## JetBrains Integration
Open the ComfyUI folder in PyCharm as a Python project. Use a venv interpreter and JetBrains AI Assistant for code help.

| JetBrains Feature | Use | Steps |
|---|---|---|
| Virtual Env | Dependency management | Settings > Python Interpreter |
| Debugger | Step through nodes | Run > Debug `main.py` |
| AI Assistant | Generate node code | Enable plugin, prompt |
| Git | Version nodes | VCS > Enable |

## LITLABS Integration
- Generate assets (icons, diagrams) via ComfyUI.
- Store outputs in Azure Blob Storage and reference from React.
- Run ComfyUI with `--listen` for API access (protect with WAF).

## Troubleshooting
| Issue | Cause | Fix |
|---|---|---|
| Install fails | Missing Python/CUDA | Install Python 3.10+, update drivers |
| Slow generation | CPU-only | Enable CUDA / use GPU |
| IDE rendering issues | Terminal UI | Use external terminal / browser |
| API port conflict | Port in use | Run with `--port 8189` |

## Key Citations
- Windows install thread: https://www.reddit.com/r/StableDiffusion/comments/1jk2tcm/step_by_step_from_fresh_windows_11_install_how_to/
- ComfyUI desktop docs: https://docs.comfy.org/installation/desktop/windows
- ComfyUI install guide: https://stable-diffusion-art.com/how-to-install-comfyui/
- JetBrains AI Assistant: https://www.jetbrains.com/help/idea/ai-assistant-in-jetbrains-ides.html
- ComfyUI plugin install: https://comfyui.org/en/installing-comfyui-plugin-made-easy
