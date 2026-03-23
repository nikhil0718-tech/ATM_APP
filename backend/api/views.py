import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User, Transaction

def test_api(request):
    return JsonResponse({"message": "API working"})

# ---------------- REGISTER ----------------
@csrf_exempt
def register(request):
    data = json.loads(request.body)

    username = data.get("username")
    pin = data.get("pin")

    if not username or not pin:
        return JsonResponse({"msg": "Enter valid details."})

    if User.objects.filter(username=username).exists():
        return JsonResponse({"msg": "Username already exists"})

    User.objects.create(username=username, pin=pin)

    return JsonResponse({"msg": "Account created successfully"})


# ---------------- LOGIN ----------------
@csrf_exempt
def login(request):
    data = json.loads(request.body)

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
    data = json.loads(request.body)

    uid = data.get("id")
    amt = float(data.get("amount"))

    user = User.objects.get(id=uid)

    if amt <= 0:
        return JsonResponse({"msg": "Invalid amount"})

    user.balance += amt
    user.save()

    Transaction.objects.create(user=user, type="deposit", amount=amt)

    return JsonResponse({"balance": user.balance})


# ---------------- WITHDRAW ----------------
@csrf_exempt
def withdraw(request):
    data = json.loads(request.body)

    uid = data.get("id")
    amt = float(data.get("amount"))

    user = User.objects.get(id=uid)

    if amt <= 0:
        return JsonResponse({"msg": "Invalid amount"})

    # ✅ minimum ₹500 rule
    if user.balance - amt < 500:
        return JsonResponse({"msg": "Minimum balance ₹500 must be maintained"})

    user.balance -= amt
    user.save()

    Transaction.objects.create(user=user, type="withdraw", amount=amt)

    return JsonResponse({"balance": user.balance})


# ---------------- BALANCE ----------------
def balance(request, id):
    user = User.objects.get(id=id)
    return JsonResponse({"balance": user.balance})


# ---------------- CHANGE PIN ----------------
@csrf_exempt
def change_pin(request):
    data = json.loads(request.body)

    username = data.get("username")
    old_pin = data.get("old_pin")
    new_pin = data.get("new_pin")

    try:
        user = User.objects.get(username=username, pin=old_pin)
        user.pin = new_pin
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

    except User.DoesNotExist:
        return JsonResponse({"transactions": []})
# ---------------- ACCOUNT ----------------
def account_details(request, id):
    user = User.objects.get(id=id)

    return JsonResponse({
        "username": user.username,
        "balance": user.balance
    })