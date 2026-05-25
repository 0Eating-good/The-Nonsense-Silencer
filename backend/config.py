import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost/nonsense_silencer"
    )
    
    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24  # 30 days
    
    # API
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    
    # CORS
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # Scrapers
    CEEC_BASE_URL = "https://www.ceec.edu.tw"
    EXCEL_URL = "https://www.bish.tp.edu.tw/get_file.php?file_name=3687147efd325df9f8a0761f1b3581a0.xls&file_dir=data2179/&rename=%E9%AB%98%E4%B8%AD%E8%8B%B1%E6%96%87%E5%96%AE%E5%AD%97+7000.xls"

config = Config()
