from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
from pinecone import Pinecone, Index
from urllib3 import make_headers
from langchain import PromptTemplate
from langchain.docstore.document import Document
from langchain.schema import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough
from langchain_pinecone import PineconeVectorStore
from langchain.chains import RetrievalQA

# Loads environment variables from the .env file
load_dotenv()

# Retrieves API keys for Google, Pinecone, and proxies from environment variables
google_api_key = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
proxy = os.getenv("HTTP_PROXY")
proxy_basic_auth = os.getenv('PROXY_BASIC_AUTH')

# Creates an instance of embeddings using the Google Generative AI API
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=google_api_key)

# Reads the content from a text file
file_path = "/home/samueloliveira/mysite/completo.txt"
with open(file_path, 'r') as file:
    final_text = file.read()

# Splits the text into smaller chunks
chunk_size = 1000  # Size of each chunk
text_chunks = [final_text[i:i + chunk_size] for i in range(0, len(final_text), chunk_size)]

# Converts the chunks into the LangChain `Document` format
docs = [Document(page_content=chunk, metadata={"source": "local"}) for chunk in text_chunks]

# Defines the Pinecone index name
index_name = "langchain-demo"

# Configures Pinecone with the proxy
pc = Pinecone(
    api_key=PINECONE_API_KEY,
    proxy_url=proxy,
    proxy_headers=make_headers(proxy_basic_auth=proxy_basic_auth)
)

# Sets the Pinecone host
host = 'https://langchain-demo-im89fas.svc.gcp-starter.pinecone.io'

# Initializes the Pinecone index
index = pc.Index(index_name)

# Defines the text field for vector storage
text_field = "text"

# Creates an instance of PineconeVectorStore using the index and embeddings
vectorstore = PineconeVectorStore(
    index, embeddings, text_field
)

# Creates a retriever object from the vector store
retriever = vectorstore.as_retriever()

# Creates an instance of the Google Generative AI chat model
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash",
                             temperature=0.7, top_p=0.85)

# Prompt template for querying Gemini
llm_prompt_template = """Você é um assistente para tarefas de perguntas e respostas.
Use o seguinte contexto para responder à pergunta.
Se você não souber a resposta, apenas diga que não sabe.
Use no máximo uma frases e mantenha a resposta concisa.

Pergunta: {question}
Contexto: {context}
Resposta:"""

# Creates a PromptTemplate from the prompt template
llm_prompt = PromptTemplate.from_template(llm_prompt_template)

# Function to format document data into a readable string format
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Defines a task chain using the RAG (Retrieval-Augmented Generation) format
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | llm_prompt
    | llm
    | StrOutputParser()
)

# Function to process a query using the RAG chain
def process_query(query):
    return rag_chain.invoke(query)
