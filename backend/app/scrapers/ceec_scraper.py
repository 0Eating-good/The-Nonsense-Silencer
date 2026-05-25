import requests
from bs4 import BeautifulSoup
import pdfplumber
import re
from typing import List, Dict
import logging
from io import BytesIO
import uuid

logger = logging.getLogger(__name__)

class CEECScraper:
    """Scraper for CEEC (大考中心) exam questions"""
    
    BASE_URL = "https://www.ceec.edu.tw"
    QUESTIONS_PAGE = "/CategoryList.aspx?Sn=38"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    async def scrape_all_questions(self) -> List[Dict]:
        """
        Scrape all available exam questions from CEEC
        """
        try:
            logger.info("Starting CEEC scraper...")
            url = self.BASE_URL + self.QUESTIONS_PAGE
            response = self.session.get(url, timeout=10)
            response.encoding = 'utf-8'
            
            soup = BeautifulSoup(response.text, 'html.parser')
            questions = []
            
            # Find all PDF download links
            pdf_links = self._extract_pdf_links(soup)
            logger.info(f"Found {len(pdf_links)} PDF files")
            
            for link in pdf_links[:10]:  # Process first 10 PDFs
                try:
                    pdf_questions = await self._parse_pdf(link)
                    questions.extend(pdf_questions)
                except Exception as e:
                    logger.warning(f"Error processing PDF {link}: {e}")
                    continue
            
            logger.info(f"Total questions scraped: {len(questions)}")
            return questions
        
        except Exception as e:
            logger.error(f"Error scraping CEEC: {e}")
            return []
    
    def _extract_pdf_links(self, soup: BeautifulSoup) -> List[str]:
        """
        Extract PDF download links from the page
        """
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if href.endswith('.pdf') or '.pdf' in href:
                full_url = href if href.startswith('http') else self.BASE_URL + href
                links.append(full_url)
        return links
    
    async def _parse_pdf(self, pdf_url: str) -> List[Dict]:
        """
        Parse a PDF file and extract questions
        """
        try:
            logger.info(f"Parsing PDF: {pdf_url}")
            response = self.session.get(pdf_url, timeout=30)
            
            # Extract year and subject from URL
            year = self._extract_year_from_url(pdf_url)
            subject = self._extract_subject_from_url(pdf_url)
            
            pdf_file = BytesIO(response.content)
            
            with pdfplumber.open(pdf_file) as pdf:
                questions = []
                for page_num, page in enumerate(pdf.pages):
                    try:
                        page_questions = self._extract_questions_from_page(
                            page, year, subject, page_num
                        )
                        questions.extend(page_questions)
                    except Exception as e:
                        logger.warning(f"Error parsing page {page_num}: {e}")
                        continue
            
            return questions
        
        except Exception as e:
            logger.error(f"Error parsing PDF {pdf_url}: {e}")
            return []
    
    def _extract_questions_from_page(self, page, year: int, subject: str, page_num: int) -> List[Dict]:
        """
        Extract individual questions from a PDF page
        This is a basic implementation - may need refinement for different PDF formats
        """
        text = page.extract_text()
        questions = []
        
        if not text:
            return questions
        
        # This is a placeholder for more sophisticated PDF parsing
        # Different years and subjects may have different PDF structures
        # For now, we'll create a template that can be enhanced
        
        # Try to detect question patterns
        lines = text.split('\n')
        
        # Example pattern matching (would need refinement)
        question_pattern = re.compile(r'^(\d+)\.\s+(.*)')
        
        current_question = None
        for line in lines:
            line = line.strip()
            
            # Check if line starts a new question
            match = question_pattern.match(line)
            if match:
                if current_question and current_question.get('content_options'):
                    questions.append(current_question)
                
                q_num = int(match.group(1))
                q_text = match.group(2)
                
                current_question = {
                    "id": f"ceec_{year}_{subject}_{q_num}_{uuid.uuid4().hex[:8]}",
                    "year": year,
                    "season": str(year - 1911),
                    "subject": subject,
                    "course_range": "必修",
                    "question_type": "選擇題",
                    "difficulty": 3,
                    "correct_rate": None,
                    "question_number": q_num,
                    "content_stem": q_text,
                    "content_options": {},
                    "answer": None,
                    "explanation": None,
                    "source_url": None,
                    "question_source": "CEEC"
                }
        
        if current_question and current_question.get('content_options'):
            questions.append(current_question)
        
        return questions
    
    def _extract_year_from_url(self, url: str) -> int:
        """
        Extract exam year from URL
        """
        # Try to find 4-digit year or Republic of China year
        match = re.search(r'(20\d{2}|11[0-2]\d)', url)
        if match:
            year_str = match.group(1)
            if year_str.startswith('11'):
                # Republic of China year, convert to Western year
                return int(year_str) + 1911
            return int(year_str)
        return 2024
    
    def _extract_subject_from_url(self, url: str) -> str:
        """
        Extract subject from URL
        """
        subject_map = {
            '國': '國文',
            '英': '英文',
            '數': '數學',
            '社': '社會',
            '自': '自然',
            '物': '物理',
            '化': '化學',
            '生': '生物',
            '地': '地球科學'
        }
        
        url_lower = url.lower()
        
        for key, value in subject_map.items():
            if key in url_lower:
                return value
        
        return '未知'
