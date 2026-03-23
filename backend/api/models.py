from django.db import models

# ---------------- USER MODEL ----------------
class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    pin = models.CharField(max_length=10)
    balance = models.FloatField(default=500)

    def __str__(self):
        return self.username


# ---------------- TRANSACTION MODEL ----------------
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20)  # deposit / withdraw
    amount = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.type} - ₹{self.amount}"