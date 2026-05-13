from pydantic import BaseModel
from datetime import datetime


class PhotoOut(BaseModel):
    id: str
    order_id: str
    file_path: str
    stage: str
    created_at: datetime

    model_config = {"from_attributes": True}
