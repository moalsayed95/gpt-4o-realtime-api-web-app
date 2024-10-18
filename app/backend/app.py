import logging
import os
from pathlib import Path

from aiohttp import web
from azure.core.credentials import AzureKeyCredential
from azure.identity import AzureDeveloperCliCredential, DefaultAzureCredential
from dotenv import load_dotenv

from ragtools import attach_rag_tools
from rtmt import RTMiddleTier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voicerag")

async def create_app():
    if not os.environ.get("RUNNING_IN_PRODUCTION"):
        logger.info("Running in development mode, loading from .env file")
        load_dotenv()
    llm_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    llm_deployment = os.environ.get("AZURE_OPENAI_REALTIME_DEPLOYMENT")
    llm_key = os.environ.get("AZURE_OPENAI_API_KEY")
    search_endpoint = os.environ.get("AZURE_SEARCH_ENDPOINT")
    search_index = os.environ.get("AZURE_SEARCH_INDEX")
    search_key = os.environ.get("AZURE_SEARCH_API_KEY")

    credential = None
    if not llm_key or not search_key:
        if tenant_id := os.environ.get("AZURE_TENANT_ID"):
            logger.info("Using AzureDeveloperCliCredential with tenant_id %s", tenant_id)
            credential = AzureDeveloperCliCredential(tenant_id=tenant_id, process_timeout=60)
        else:
            logger.info("Using DefaultAzureCredential")
            credential = DefaultAzureCredential()
    llm_credential = AzureKeyCredential(llm_key) if llm_key else credential
    search_credential = AzureKeyCredential(search_key) if search_key else credential
    
    app = web.Application()

    rtmt = RTMiddleTier(llm_endpoint, llm_deployment, llm_credential)
    rtmt.system_message = """
        You are an AI assistant cohosting the a Microsoft AI tour event.
        Your main job is to assist the main host 'Mervi Airaksinen' in answering questions about the event
        You can speak many languages and in different a as requested. You will be friendly and professional.

        EVENT INFROMATION:
        - Location: Helsinki Finland.
        - Date: 31st of October 2024.

        Some questions related to the event might be:
        - What is on the agenda today?
        - What companies are presenting today?
        - What are the topics of the presentations?
        - What is the schedule for the day?
        - What is the location of the event?
        - What is the date of the event?
        - What is the main host's name?
        and so on... you get the idea.

        If you are asked: what is your message to the audience? you can say:
        "Welcome to the Microsoft AI tour event. It is a pleasure to be here with you today. Enjoy the presentations and have a great day!"

        KNOWLEDGE BASE INFORMATION:
        FILES: 
        - 'Business Track.txt'
        - 'Solution Focus Track.txt'
        - 'Keynote.txt'
        
        The Business Track file document outlines a series of presentations from various companies focused on 
        the use of AI technologies such as Microsoft 365 Copilot across different industries like construction, 
        healthcare, and manufacturing. It includes speaker details, topics discussed, and summaries of each company’s 
        AI journey and practical implementations.

        The Solution Track file The document outlines a schedule of AI-related presentations across four rooms, 
        covering topics such as AI app development, Microsoft 365 Copilot customization, infrastructure for 
        scalable AI applications, and end-to-end security. Each session includes details about the speakers, 
        companies, and specific themes, focusing on practical applications and innovations within Microsoft's 
        AI and cloud technologies.

        IMPORTANT NOTES TO REMEMBER:
        - When answering questions be super concise and straight to the point.
        - Answer with I don't know if you do not know the answer.
        - Never read file names or source names or keys out loud.
        - Remember to ALWAYS use the 'search' tool to check the knowledge base when asked about the Microsoft event related questions
        - ALWAYS speak in normal voice unless you are explicitly asked to whisper or shout or speed up or slow down.
        """
    
    attach_rag_tools(rtmt, search_endpoint, search_index, search_credential)

    rtmt.attach_to_app(app, "/realtime")

    current_directory = Path(__file__).parent
    app.add_routes([web.get('/', lambda _: web.FileResponse(current_directory / 'static/index.html'))])
    app.router.add_static('/', path=current_directory / 'static', name='static')
    
    return app

if __name__ == "__main__":
    host = "localhost"
    port = 8765
    web.run_app(create_app(), host=host, port=port)
