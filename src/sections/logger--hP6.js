    EM();
    Kz();
    UB();
    SM();
    M0q();
    vX();
    gl = z1("AzurePowerShellCredential");
    (W0q = {
      login: "Run Connect-AzAccount to login",
      installed:
        "The specified module 'Az.Accounts' with version '2.2.0' was not loaded because no valid module file was found in any module directory",
    }),
      (vP6 = {
        login: "Please run 'Connect-AzAccount' from PowerShell to authenticate before using this credential.",
        installed: `The 'Az.Account' module >= 2.2.0 is not installed. Install the Azure Az PowerShell module with: "Install-Module -Name Az -Scope CurrentUser -Repository PSGallery -Force".`,
        troubleshoot: "To troubleshoot, visit https://aka.ms/azsdk/js/identity/powershellcredential/troubleshoot.",
      }),
      (NP6 = [X0q("pwsh")]);
    if (P0q) NP6.push(X0q("powershell"));
