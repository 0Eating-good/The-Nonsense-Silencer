import pandas as pd
from typing import List, Dict
import logging
import requests
from io import BytesIO
import uuid

logger = logging.getLogger(__name__)

class ExcelParser:
    """Parser for 7000 Words Excel file"""
    
    EXCEL_URL = "https://www.bish.tp.edu.tw/get_file.php?file_name=3687147efd325df9f8a0761f1b3581a0.xls&file_dir=data2179/&rename=%E9%AB%98%E4%B8%AD%E8%8B%B1%E6%96%87%E5%96%AE%E5%AD%97+7000.xls"
    
    def __init__(self):
        pass
    
    async def parse_7000_words(self) -> List[Dict]:
        """
        Download and parse 7000 words Excel file
        Returns list of question dictionaries
        """
        try:
            logger.info("Downloading 7000 words Excel file...")
            response = requests.get(self.EXCEL_URL, timeout=60)
            response.raise_for_status()
            
            excel_file = BytesIO(response.content)
            
            # Try different sheet names
            sheet_names = [0, 'Sheet1', '單字', '7000單', '7000']
            df = None
            
            for sheet_name in sheet_names:
                try:
                    df = pd.read_excel(excel_file, sheet_name=sheet_name)
                    logger.info(f"Successfully read sheet: {sheet_name}")
                    break
                except:
                    excel_file.seek(0)
                    continue
            
            if df is None:
                df = pd.read_excel(excel_file)
            
            logger.info(f"Excel file loaded, shape: {df.shape}")
            
            questions = []
            for idx, row in df.iterrows():
                question = self._parse_row(row, idx)
                if question:
                    questions.append(question)
            
            logger.info(f"Parsed {len(questions)} questions from Excel")
            return questions
        
        except Exception as e:
            logger.error(f"Error parsing Excel: {e}")
            return []
    
    def _parse_row(self, row, index: int) -> Dict or None:
        """
        Parse a single row from the Excel file
        Flexible column matching for different Excel formats
        """
        try:
            row_data = row.to_dict() if hasattr(row, 'to_dict') else row
            
            # Try to extract data with flexible column matching
            chinese = None
            english = None
            option_a = None
            option_b = None
            option_c = None
            option_d = None
            answer = None
            level = 3
            
            # Get values by position or name
            values = list(row_data.values()) if isinstance(row_data, dict) else row_data.tolist()
            
            if len(values) < 7:
                return None
            
            # Extract based on common patterns
            for i, val in enumerate(values):
                val_str = str(val).strip() if pd.notna(val) else ""
                
                if i == 0 and val_str:
                    chinese = val_str
                elif i == 1 and val_str:
                    english = val_str
                elif i == 2 and val_str:
                    option_a = val_str
                elif i == 3 and val_str:
                    option_b = val_str
                elif i == 4 and val_str:
                    option_c = val_str
                elif i == 5 and val_str:
                    option_d = val_str
                elif i == 6 and val_str:
                    answer = str(val_str).upper()
                    # Ensure answer is single letter
                    if len(answer) > 1:
                        answer = answer[0]
                elif i == 7:
                    try:
                        level = int(float(val))
                    except:
                        level = 3
            
            # Validate required fields
            if not english or not answer:
                return None
            
            if not option_a or not option_b or not option_c or not option_d:
                return None
            
            # Map level to difficulty (3-6 to 1-5 scale)
            difficulty = max(1, min(5, level - 2)) if isinstance(level, int) else 3
            
            return {
                "id": f"7000_word_{index}_{uuid.uuid4().hex[:8]}",
                "year": 2024,
                "season": "current",
                "subject": "英文",
                "course_range": "必修",
                "question_type": "英翻中選擇題",
                "difficulty": difficulty,
                "correct_rate": None,
                "question_number": index + 1,
                "content_stem": f"{english}\n\n{chinese}" if chinese else english,
                "content_options": {
                    "A": option_a,
                    "B": option_b,
                    "C": option_c,
                    "D": option_d
                },
                "answer": answer if answer in ['A', 'B', 'C', 'D'] else None,
                "explanation": None,
                "source_url": self.EXCEL_URL,
                "question_source": "7000_WORDS"
            }
        
        except Exception as e:
            logger.warning(f"Error parsing row {index}: {e}")
            return None
