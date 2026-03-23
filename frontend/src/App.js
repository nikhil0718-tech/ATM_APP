import React, { useState, useEffect } from "react";
import "./App.css";

// -------------------- Custom Exceptions --------------------


const API ="https://atm-backend-ijqf.onrender.com/api/";
export default function App() {

  const [section, setSection] = useState("register");
  const [nextAction, setNextAction] = useState("menu");

  const [username, setUsername] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pin, setPin] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const [loginMsg, setLoginMsg] = useState("");
  const [registerMsg, setRegisterMsg] = useState("");

  const [userId, setUserId] = useState(null);
  const [newUserPin, setNewUserPin] = useState("");

  // ✅ NEW
  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState({});

  // ---------------- Navigation ----------------
  const goToRegister = () => setSection("register");
  const goToLogin = () => setSection("login");
  const showMenu = () => setSection("menu");
  const openDeposit = () => setSection("deposit");
  const openWithdraw = () => setSection("withdraw");

  // ---------------- Message ----------------
  const showMessage = (msg, action = "menu") => {
    setMessage(msg);
    setNextAction(action);
    setSection("message");
  };

  const closeMessage = () => {
    if (nextAction === "login") goToLogin();
    else showMenu();
    setNextAction("menu");
  };

  // ---------------- Register ----------------
  const register = async () => {
    try {
      if (!username || !newPin) {
        setRegisterMsg("Enter valid details.");
        return;
      }

      if (newPin.length < 4) {
        setRegisterMsg("PIN must be at least 4 digits.");
        return;
      }

      const res = await fetch(API + "register/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, pin: newPin })
      });

      const data = await res.json();

      if (data.msg === "Account created successfully") {
        setUsername("");
        setNewPin("");
        setRegisterMsg("");

        showMessage("✅ Account created successfully\nPlease login", "login");
      } else {
        setRegisterMsg(data.msg);
      }

    } catch {
      setRegisterMsg("Server error");
    }
  };

  // ---------------- Login ----------------
  const login = async () => {
  try {
    if (!username || !pin) {
      setLoginMsg("Enter details");
      return;
    }

    const res = await fetch(API + "login/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: username,
        pin: pin
      })
    });

    const data = await res.json();

    if (data.msg === "success") {
      setUserId(data.id);
      showMenu();
    } else {
      setLoginMsg("❌ Invalid credentials");
    }

  } catch {
    setLoginMsg("Server error");
  }
};
  // ---------------- Deposit ----------------
 const handleDeposit = async () => {
  try {
    if (!amount) {
      showMessage("❌ Please enter amount");
      return;
    }

    let damt = parseFloat(amount);

    if (isNaN(damt)) {
      showMessage("❌ Enter valid number");
      return;
    }

    if (damt <= 0) {
      showMessage("❌ Amount must be greater than 0");
      return;
    }

    const res = await fetch(API + "deposit/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ id: userId, amount: damt })
    });

    const data = await res.json();

    // ✅ HANDLE BACKEND ERROR
    if (data.msg) {
      showMessage(`❌ ${data.msg}`);
      return;
    }

    // ✅ SUCCESS
    setAmount("");
    showMessage(`💳 Deposit Successful\nAmount: ₹${damt}\nBalance: ₹${data.balance}`);

  } catch {
    showMessage("❌ Server error");
  }
};
  // ---------------- Withdraw ----------------
  const handleWithdraw = async () => {
  try {
    let wamt = parseFloat(amount);

    if (isNaN(wamt) || wamt <= 0) throw new Error();

    const res = await fetch(API + "withdraw/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ id: userId, amount: wamt })
    });

    const data = await res.json();

    // ✅ ERROR CASE
    if (data.msg) {
      showMessage(`⚠️ ${data.msg}`);
      return;
    }

    // ✅ SUCCESS
    setAmount("");
    showMessage(`💳 Withdraw Successful\n\nAmount : ₹${wamt}\nBalance : ₹${data.balance}`);

  } catch {
    showMessage("❌ Invalid withdraw amount");
  }
};
// ---------------- Balance ----------------
const balenq = async () => {
  try {
    if (!userId) {
      showMessage("Login first");
      return;
    }

    const res = await fetch(API + `balance/${userId}/`);
    const data = await res.json();

    if (data.msg) {
      showMessage(data.msg);
      return;
    }

    showMessage(`💰 Current Balance: ₹${data.balance}`);

  } catch {
    showMessage("Server error");
  }
};

  // ✅ ---------------- Transactions ----------------
  const fetchTransactions = async () => {
  try {
    const res = await fetch(API + `transactions/${userId}/`);

    if (!res.ok) {
      throw new Error("API error");
    }

    const data = await res.json();

    setTransactions(data.transactions || []);
    setSection("transactions");

  } catch (err) {
    console.log("Transaction Error:", err);
    showMessage("Error loading transactions");
  }
};

  // ✅ ---------------- Account ----------------
  const fetchAccount = async () => {
    try {
      const res = await fetch(API + `account/${userId}/`);
      const data = await res.json();

      setAccount(data || {});
      setSection("account");

    } catch {
      showMessage("Error loading account");
    }
  };
  // ---------------- Change PIN ----------------
    const changePin = async () => {
  try {
    if (!username || !pin || !newUserPin) {
      showMessage("❌ Enter all details");
      return;
    }

    if (newUserPin.length < 4) {
      showMessage("❌ PIN must be at least 4 digits");
      return;
    }

    const res = await fetch(API + "change-pin/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: username,
        old_pin: pin,
        new_pin: newUserPin
      })
    });

    const data = await res.json();

    if (data.msg === "PIN updated successfully") {
      setUsername("");
      setPin("");
      setNewUserPin("");

      showMessage("✅ PIN updated successfully", "login");
    } else {
      showMessage(`❌ ${data.msg}`);
    }

  } catch {
    showMessage("Server error");
  }
};
  // ---------------- Logout ----------------
  const logout = () => {
    setUserId(null);
    showMessage("🔒 Logged out successfully", "login");
  };

  useEffect(() => {
    goToRegister();
  }, []);

  return (
    <div className="container">

      {/* REGISTER */}
      {section === "register" && (
        <>
          <h2>Create Account</h2>
          <input placeholder="Enter Name" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Create PIN" value={newPin} onChange={e => setNewPin(e.target.value)} />
          <button onClick={register}>Create Account</button>
          <p className="error">{registerMsg}</p>
          <p>Already have account? <span className="link" onClick={goToLogin}>Login</span></p>
        </>
      )}

      {/* LOGIN */}
      {section === "login" && (
  <>
    <h2>ATM Login</h2>

    <input
  placeholder="Enter Username"
  value={username}
  onChange={e => setUsername(e.target.value)}
/>

<input
  type="password"
  placeholder="Enter PIN"
  value={pin}
  onChange={e => {
    setPin(e.target.value);
    setLoginMsg("");
  }}
/>
    <button onClick={login}>Login</button>

    <p className="error">{loginMsg}</p>

    {/* Create Account */}
    <p>
      New user?
      <span className="link" onClick={goToRegister}> Create Account</span>
    </p>

    {/* ✅ NEW */}
    <p>
      Forgot PIN?
      <span className="link" onClick={() => setSection("changePin")}>
        Reset PIN
      </span>
    </p>
  </>
)}

      {/* MENU */}
      {section === "menu" && (
        <div>
          <h2>ATM Menu</h2>

          <button onClick={openDeposit}>Deposit</button>
          <button onClick={openWithdraw}>Withdraw</button>
          <button onClick={balenq}>Balance</button>
          <button onClick={fetchTransactions}>Transactions</button>
          <button onClick={fetchAccount}>Account</button>
          <button onClick={() => setSection("changePin")}>Change PIN</button>
          <button onClick={logout}>Exit</button>
        </div>
      )}
      {/* DEPOSIT */}
      {section === "deposit" && (
        <>
          <h2>Deposit</h2>

          <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />

          <button onClick={handleDeposit}>Submit</button>
          <button onClick={showMenu}>Back</button>
        </>
      )}

      {/* WITHDRAW */}
      {section === "withdraw" && (
        <>
          <h2>Withdraw</h2>

          <input
            placeholder="Enter Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <button onClick={handleWithdraw}>Submit</button>
          <button onClick={showMenu}>Back</button>
        </>
      )}
      {/* TRANSACTIONS */}
      {section === "transactions" && (
        <>
          <h2>Transactions</h2>
          {transactions.length === 0 ? <p>No transactions yet</p> :
            transactions.map((t, i) => <p key={i}>{t}</p>)
          }
          <button onClick={showMenu}>Back</button>
        </>
      )}

      {/* ACCOUNT */}
      {section === "account" && (
        <>
          <h2>Account Details</h2>
          <p>Name: {account.username || "Loading..."}</p>
          <p>Balance: ₹{account.balance ?? "Loading..."}</p>
          <button onClick={showMenu}>Back</button>
        </>
      )}
      {/* CHANGE PIN */}
      {section === "changePin" && (
  <>
    <h2>Reset PIN</h2>

    <input
      placeholder="Enter Username"
      value={username}
      onChange={e => setUsername(e.target.value)}
    />

    <input
      type="password"
      placeholder="Enter current PIN"
      value={pin}
      onChange={e => setPin(e.target.value)}
    />

    <input
      type="password"
      placeholder="Enter new PIN"
      value={newUserPin}
      onChange={e => setNewUserPin(e.target.value)}
    />

    <button onClick={changePin}>Update PIN</button>
    <button onClick={goToLogin}>Back</button>
  </>
)}

      {/* MESSAGE */}
      {section === "message" && (
        <div className="overlay">
          <div className="messageBox">
            <p style={{ whiteSpace: "pre-line" }}>{message}</p>
            <button onClick={closeMessage}>OK</button>
          </div>
        </div>
      )}

    </div>
  );
}