    RP6();
    LP6();
    kP6();
    hP6();
    VP6();
    bP6();
    SM_();
    Kz();
    IP6 = z1("DefaultAzureCredential");
    KdH = class KdH extends sgH {
      constructor(H) {
        let _ = process.env.AZURE_TOKEN_CREDENTIALS ? process.env.AZURE_TOKEN_CREDENTIALS.trim().toLowerCase() : void 0,
          q = [I14, u14, b14],
          $ = [x14, C14, E14],
          K = [];
        if (_)
          switch (_) {
            case "dev":
              K = q;
              break;
            case "prod":
              K = $;
              break;
            default: {
              let T = `Invalid value for AZURE_TOKEN_CREDENTIALS = ${process.env.AZURE_TOKEN_CREDENTIALS}. Valid values are 'prod' or 'dev'.`;
              throw (IP6.warning(T), Error(T));
            }
          }
        else K = [...$, ...q];
        let O = K.map((T) => {
          try {
            return T(H);
          } catch (z) {
            return (
              IP6.warning(`Skipped ${T.name} because of an error creating the credential: ${z}`),
              new L0q(T.name, z.message)
            );
          }
        });
        super(...O);
      }
    };
