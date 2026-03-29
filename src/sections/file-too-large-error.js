    T7();
    (mc_ = require("fs")), (pc_ = require("fs/promises"));
    tH_ = class tH_ extends Error {
      sizeInBytes;
      maxSizeBytes;
      constructor(H, _) {
        super(
          `File content (${t7(H)}) exceeds maximum allowed size (${t7(_)}). Use offset and limit parameters to read specific portions of the file, or search for specific content instead of reading the whole file.`,
        );
        this.sizeInBytes = H;
        this.maxSizeBytes = _;
        this.name = "FileTooLargeError";
      }
    };
