import peewee as pw

class Permission(pw.Model):
    permission_id = pw.PrimaryKeyField(pw.IntegerField())
    permission_title = pw.TextField()

class UserRole(pw.Model):
    role_name = pw.PrimaryKeyField(pw.TextField())
    permissions = pw.TextField() # Comma seperated list of permission IDs

class User(pw.Model):
    username = pw.PrimaryKeyField(pw.TextField())
    displayname = pw.TextField()
    email = pw.TextField()
    