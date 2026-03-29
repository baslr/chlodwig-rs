    NJ();
    qy();
    N_();
    M9();
    Ye1 = {
      macos: ["pbcopy"],
      linux: ["xclip -selection clipboard", "wl-copy"],
      wsl: [
        "powershell.exe -NoProfile -Command '[Console]::InputEncoding=[Text.Encoding]::UTF8;Set-Clipboard([Console]::In.ReadToEnd())'",
        "clip.exe",
      ],
      windows: [
        'powershell -NoProfile -Command "[Console]::InputEncoding=[Text.Encoding]::UTF8;Set-Clipboard([Console]::In.ReadToEnd())"',
        "clip",
      ],
      unknown: ["xclip -selection clipboard", "wl-copy"],
    };
