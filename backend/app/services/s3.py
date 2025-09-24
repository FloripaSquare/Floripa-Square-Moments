import boto3
import mimetypes
import uuid
import time
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from ..settings import settings

s3 = boto3.client(
    "s3",
    region_name=settings.AWS_REGION,
    config=Config(signature_version="s3v4")
)

BUCKET_RAW = settings.S3_BUCKET_RAW
EXPIRE = settings.PRESIGNED_EXPIRE_SECONDS


def put_bytes(bucket: str, key: str, data: bytes, content_type="application/octet-stream"):
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
        ServerSideEncryption="aws:kms"
    )


def presign_get(bucket: str, key: str, expires: int = EXPIRE) -> str:
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires,
    )


def presign_put(bucket: str, key: str, content_type: str, expires: int = EXPIRE) -> str:
    return s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": bucket,
            "Key": key,
            "ContentType": content_type,
            "ServerSideEncryption": "aws:kms",
        },
        ExpiresIn=expires,
    )


def guess_ext(content_type: str) -> str:
    ext = mimetypes.guess_extension(content_type) or ""
    return ".jpg" if ext == ".jpe" else ext


def make_object_key(event_slug: str, original_name: str) -> str:
    ts = int(time.time())
    return f"{event_slug}/photos/{ts}-{uuid.uuid4().hex}-{original_name}"


def list_keys_in_prefix(bucket: str, prefix: str) -> list[str]:
    keys = []
    paginator = s3.get_paginator("list_objects_v2")
    try:
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            for obj in page.get("Contents", []):
                keys.append(obj["Key"])
    except (BotoCoreError, ClientError) as e:
        print(f"Erro ao listar objetos no S3: {e}")
    return keys
