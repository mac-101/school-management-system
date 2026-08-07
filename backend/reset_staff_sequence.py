import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
import django
django.setup()
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT setval(pg_get_serial_sequence('staff_staff','id'), (SELECT COALESCE(MAX(id), 1) FROM staff_staff));")
print("sequence reset")
