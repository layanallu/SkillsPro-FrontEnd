import os  # Operating system interactions (paths, environment variables)
import re  # Regular expressions for extracting patterns from text
import io  # In-memory byte-stream for reading PDF bytes

# Flask web framework imports
from flask import (
    Flask,               # Main Flask application class
    request,             # To access request data (files, form inputs)
    render_template,     # To render HTML templates
    jsonify,             # To return JSON responses
    send_from_directory  # To serve static files
)
from dotenv import load_dotenv  # Load environment variables from a .env file
import pdfplumber                # PDF parsing library to extract text from PDFs
import google.generativeai as genai  # Google Gemini AI client library

# ─── Configuration ─────────────────────────────────────────────────────────
# Load variables from .env (e.g. API keys)
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")  # Fetch the Gemini API key
if not API_KEY:
    # Stop execution if API key is missing
    raise RuntimeError("Please set GOOGLE_API_KEY in your .env")
# Configure the Gemini client with the API key
genai.configure(api_key=API_KEY)

# ─── Paths ──────────────────────────────────────────────────────────────────
# Directory of this Python file
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Assume front-end files (HTML, CSS, JS) live one level up
CLIENT_DIR = os.path.abspath(os.path.join(BASE_DIR, os.pardir))

# Initialize Flask app, pointing template_folder at CLIENT_DIR
app = Flask(
    __name__,
    template_folder=CLIENT_DIR,
    static_folder=None  # We'll serve static manually
)
# Configure an upload folder (if we choose to persist files)
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploaded')
# Ensure the folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ─── Static Routes ─────────────────────────────────────────────────────────
# Serve CSS files
@app.route('/Styles/<path:fn>')
def serve_styles(fn):
    return send_from_directory(os.path.join(CLIENT_DIR, 'Styles'), fn)

# Serve JS files
@app.route('/script/<path:fn>')
def serve_scripts(fn):
    return send_from_directory(os.path.join(CLIENT_DIR, 'script'), fn)

# Serve image files
@app.route('/img/<path:fn>')
def serve_images(fn):
    return send_from_directory(os.path.join(CLIENT_DIR, 'img'), fn)

# Home route: render the main CVs.html page
@app.route('/')
def home():
    return render_template('CVs.html')

# ─── Helper Functions ───────────────────────────────────────────────────────
def extract_text_from_bytes(pdf_bytes: bytes) -> str:
    """
    Extract all textual content from a PDF given its raw bytes.
    Uses pdfplumber to open and read each page's text.
    Returns combined text or empty string if extraction fails.
    """
    text = ""
    with io.BytesIO(pdf_bytes) as buffer:
        try:
            with pdfplumber.open(buffer) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception:
            # Likely a scanned/image-only PDF
            return ""
    return text.strip()


def is_resume_text(text: str) -> bool:
    """
    Quick heuristic: checks for presence of at least 3 common resume keywords.
    Returns True if text resembles a resume.
    """
    keywords = ["experience", "education", "skills", "contact", "summary", "projects"]
    lower = text.lower()
    found = sum(1 for kw in keywords if kw in lower)
    return found >= 3


def ai_is_resume(text: str) -> bool:
    """
    Fallback classifier: uses Gemini to decide YES/NO if snippet is a CV.
    Sends first 2000 characters in a simple prompt.
    """
    snippet = text[:2000].replace("\n", " ")
    prompt = f"""
Classify whether the following document text is a professional resume/CV.
Answer with exactly ONE word: YES or NO.

Document snippet:
{snippet}
"""
    response = genai.GenerativeModel("gemini-1.5-flash") \
                    .generate_content(prompt).text.strip().upper()
    return response.startswith("YES")

# Regex patterns for parsing model output
SCORE_RE = re.compile(r"Score:\s*(\d{1,3})/100")
ROLE_RE  = re.compile(r"Suitable Role:\s*(.+)")


# ─── Scoring Functions ─────────────────────────────────────────────────────
def score_resume(resume_text: str, job_desc: str, filename: str, peers_count: int) -> (int, str):
    """
    Prompt Gemini to score a single resume against a provided job description.
    Returns the numeric score (int) and the raw text analysis (str).
    """
    # Build a structured prompt with 50/30/20 sections and bullet placeholders\    # Explain rubric to the model
    prompt = f"""
Candidate: {filename}
Score: <number>/100

If a job description is provided, score based on:
- Skills (50%): hard skills relevant to the job; include soft skills only if JD specifies and CV evidences them
- Experience (30%): years and relevance of past roles
- Qualifications (20%): education and certifications for the role
"""
    # Instruct the model to fill in each section with percentages and explanations
    prompt += "\nWhy <number>/100?"
    prompt += "\n- Skills: <percentage>/50"
    prompt += "\n  - Explanation: <why these skills earned that score>"
    prompt += "\n- Experience: <percentage>/30"
    prompt += "\n  - Explanation: <why this experience earned that score>"
    prompt += "\n- Qualifications: <percentage>/20"
    prompt += "\n  - Explanation: <why these qualifications earned that score>"
    # If comparing multiple resumes, add comparison bullet
    if peers_count > 1:
        prompt += "\n- Comparison: <compare this candidate to others based on JD>"
    # Append the actual job description and resume text
    prompt += f"""

Job description:
{job_desc}

Resume Text:
{resume_text}

Return exactly in this order and format, using plain text bullets only:
Candidate: <filename>
Score: <number>/100
Why <number>/100?
- Skills: <percentage>/50
  - Explanation: <bullet>
- Experience: <percentage>/30
  - Explanation: <bullet>
- Qualifications: <percentage>/20
  - Explanation: <bullet>
- Comparison:
  - <bullet>   # include only if multiple resumes ONLY
Strengths:
- <bullet points>
Summary Overview:
- <bullet points>
"""
    # Execute the model call
    raw = genai.GenerativeModel("gemini-1.5-flash").generate_content(prompt).text.strip()
    # Extract numeric score via regex
    m = SCORE_RE.search(raw)
    score = int(m.group(1)) if m else 0
    return score, raw


def general_analysis(resume_text: str, filename: str) -> (int, str, str):
    """
    When no job description is provided, ask Gemini to suggest a Role and score generally.
    Returns (score, suggested_role, raw_analysis_text).
    """
    prompt = f"""
Candidate: {filename}
Suitable Role: <position>
Score: <number>/100

Perform a general analysis with:
- Skills (50%): core hard skills inferred from CV
- Experience (30%): total relevant years and depth
- Qualifications (20%): key certifications and education
"""
    prompt += "\nWhy <number>/100?"
    prompt += "\n- Skills: <percentage>/50"
    prompt += "\n  - Explanation: <why skills earned that score>"
    prompt += "\n- Experience: <percentage>/30"
    prompt += "\n  - Explanation: <why experience earned that score>"
    prompt += "\n- Qualifications: <percentage>/20"
    prompt += "\n  - Explanation: <why qualifications earned that score>"
    prompt += f"""

Resume Text:
{resume_text}

Return exactly in this order and format, plain text bullets only:
Candidate: {filename}
Suitable Role: <position>
Score: <number>/100
Why <number>/100?
- Skills: <percentage>/50
  - Explanation: <bullet>
- Experience: <percentage>/30
  - Explanation: <bullet>
- Qualifications: <percentage>/20
  - Explanation: <bullet>
Strengths:
- <bullet points>
Summary Overview:
- <bullet points>
"""
    # Model call and regex extraction
    raw = genai.GenerativeModel("gemini-1.5-flash").generate_content(prompt).text.strip()
    m_score = SCORE_RE.search(raw)
    score = int(m_score.group(1)) if m_score else 0
    # Extract suggested role
    m_role = ROLE_RE.search(raw)
    role = m_role.group(1).strip() if m_role else ''
    return score, role, raw

# ─── Main Route ────────────────────────────────────────────────────────────
@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Endpoint to handle uploaded CVs:
      1. Validates file type and content
      2. Scores valid resumes
      3. Returns JSON with `results` and any `invalid` errors
    """
    try:
        # Step 1: Retrieve uploads
        files = request.files.getlist('resumes')
        if not files:
            return jsonify(error="No resumes uploaded"), 400

        resumes = []  # List of valid resumes to process
        errors = []   # Capture validation errors per file

        # Step 2: Validate and extract text
        for f in files:
            pdf_bytes = f.read()
            text = extract_text_from_bytes(pdf_bytes)
            if not text:
                errors.append(f"Could not extract text from {f.filename}")
                continue
            # Heuristic first, then AI fallback
            if not is_resume_text(text) and not ai_is_resume(text):
                errors.append(f"{f.filename} does not appear to be a resume")
                continue
            resumes.append({'filename': f.filename, 'text': text})

        # If nothing valid, return errors only
        if not resumes:
            return jsonify(error="No valid resumes to analyze", invalid=errors), 400

        # Step 3: Parse optional job descriptions
        jobs = [j.strip() for j in request.form.get('job_descriptions','').splitlines() if j.strip()]
        results = {}

        # Step 4: Score each valid resume
        if jobs:
            for i, job in enumerate(jobs, 1):
                bucket = []
                for r in resumes:
                    score, analysis = score_resume(r['text'], job, r['filename'], len(resumes))
                    bucket.append({'filename': r['filename'], 'score': score, 'analysis': analysis})
                # Sort descending by score
                bucket.sort(key=lambda x: x['score'], reverse=True)
                results[f"Job {i}"] = bucket
        else:
            bucket = []
            for r in resumes:
                score, role, analysis = general_analysis(r['text'], r['filename'])
                bucket.append({'filename': r['filename'], 'suggested_role': role, 'score': score, 'analysis': analysis})
            bucket.sort(key=lambda x: x['score'], reverse=True)
            results['General Analysis'] = bucket

        # Step 5: Return both valid scores and any file-level errors
        return jsonify(results=results, invalid=errors)

    except genai.Error:
        # AI service-specific errors
        return jsonify(error="AI service is currently unavailable. Please try again later."), 502
    except Exception:
        # Log unexpected errors server-side for debugging
        app.logger.exception("Unexpected error in analyze()")
        return jsonify(error="Internal server error. Please contact support."), 500

# Run app when executed directly
if __name__ == '__main__':
    # debug=True enables auto-reload and stack traces in browser
    app.run(debug=True)
