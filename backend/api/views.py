import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User, Transaction


def test_api(request):
    return JsonResponse({"message": "API working"})


# ---------------- REGISTER ----------------
@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"msg": "Invalid request method"})

    try:
        data = json.loads(request.body)
    except:
        return JsonResponse({"msg": "Invalid JSON"})

    username = data.get("username")
    pin = data.get("pin")

    if not username or not pin:
        return JsonResponse({"msg": "Enter valid details."})

    if User.objects.filter(username=username).exists():
        return JsonResponse({"msg": "Username already exists"})

    user = User.objects.create(username=username, pin=pin)

    return JsonResponse({"msg": "Account created successfully", "id": user.id})


# ---------------- LOGIN ----------------
@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"msg": "Invalid request method"})

    try:
        data = json.loads(request.body)
    except:
        return JsonResponse({"msg": "Invalid JSON"})

    username = data.get("username")
    pin = data.get("pin")

    try:
        user = User.objects.get(username=username, pin=pin)
        return JsonResponse({"msg": "success", "id": user.id})
    except User.DoesNotExist:
        return JsonResponse({"msg": "fail"})


# ---------------- DEPOSIT ----------------
@csrf_exempt
def deposit(request):
    if request.method != "POST":
        return JsonResponse({"msg": "Invalid request"})

    try:
        data = json.loads(request.body)
        user = User.objects.get(id=data.get("id"))
        amt = float(data.get("amount"))
    except:
        return JsonResponse({"msg": "Invalid data"})

    if amt <= 0:
        return JsonResponse({"msg": "Invalid amount"})

    user.balance += amt
    user.save()

    Transaction.objects.create(user=user, type="deposit", amount=amt)

    return JsonResponse({"balance": user.balance})


# ---------------- WITHDRAW ----------------
@csrf_exempt
def withdraw(request):
    if request.method != "POST":
        return JsonResponse({"msg": "Invalid request"})

    try:
        data = json.loads(request.body)
        user = User.objects.get(id=data.get("id"))
        amt = float(data.get("amount"))
    except:
        return JsonResponse({"msg": "Invalid data"})

    if amt <= 0:
        return JsonResponse({"msg": "Invalid amount"})

    if user.balance - amt < 500:
        return JsonResponse({"msg": "Minimum balance ₹500 must be maintained"})

    user.balance -= amt
    user.save()

    Transaction.objects.create(user=user, type="withdraw", amount=amt)

    return JsonResponse({"balance": user.balance})


# ---------------- BALANCE ----------------
def balance(request, id):
    try:
        user = User.objects.get(id=id)
        return JsonResponse({"balance": user.balance})
    except:
        return JsonResponse({"msg": "User not found"})


# ---------------- CHANGE PIN ----------------
@csrf_exempt
def change_pin(request):
    if request.method != "POST":
        return JsonResponse({"msg": "Invalid request"})

    try:
        data = json.loads(request.body)
        user = User.objects.get(username=data.get("username"), pin=data.get("old_pin"))
        user.pin = data.get("new_pin")
        user.save()
        return JsonResponse({"msg": "PIN updated successfully"})
    except:
        return JsonResponse({"msg": "Invalid username or PIN"})


# ---------------- TRANSACTIONS ----------------
def get_transactions(request, id):
    try:
        user = User.objects.get(id=id)
        txns = Transaction.objects.filter(user=user).order_by('-date')

        data = [
            f"{t.type.capitalize()} ₹{t.amount} on {t.date.strftime('%d-%m-%Y %H:%M')}"
            for t in txns
        ]

        return JsonResponse({"transactions": data})
    except:
        return JsonResponse({"transactions": []})


# ---------------- ACCOUNT ----------------
def account_details(request, id):
    try:
        user = User.objects.get(id=id)
        return JsonResponse({
            "username": user.username,
            "balance": user.balance
        })
    except:
        return JsonResponse({"msg": "User not found"})