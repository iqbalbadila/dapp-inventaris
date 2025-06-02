import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useNavigate } from 'react-router-dom';
import contractData from '../artifacts/deployment.json';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Register() {

  const [name, setName] = useState("");
  const [role, setRole] = useState("");  // input role
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register Account";
  }, []);

  useEffect(() => {
    async function connectWallet() {
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          const contr = new Contract(
            contractData.address,
            contractData.abi,
            signer
          );

          setContract(contr);
          setSigner(signer);
        } catch (err) {
          console.error("User denied access: ", err);
          errAlert(err);
        }
      } else {
        console.error("MetaMask is not installed");
      }
    }
    connectWallet();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        connectWallet();
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", connectWallet);
      }
    };
  }, []);

  const registerUser = async (e) => {
    e.preventDefault();
    setLoader(true);

    if (!name || role === "") {
      MySwal.fire({
        icon: 'warning',
        title: 'Form tidak lengkap',
        text: 'Harap isi nama dan pilih role terlebih dahulu'
      });
      setLoader(false);
      return;
    }

    try {
      const roleInt = BigInt(role); // jika di smart contract role bertipe uint
      console.log(name, roleInt);
      const tx = await contract.userRegist(name, roleInt);
      await tx.wait();  // tunggu transaksi selesai

      MySwal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil',
        text: 'Anda dapat login setelah ini',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        navigate('/login');
      });

    } catch (err) {
      errAlert(err, "Gagal melakukan registrasi");
      setLoader(false);
    }
  };

  const errAlert = (err, customMsg) => {
    const errorObject = {
      message: err.reason || err.message || "Unknown error",
      data: err.data || {},
      transactionHash: err.transactionHash || null
    };

    MySwal.fire({
      title: errorObject.message,
      text: customMsg,
      icon: 'error',
      confirmButtonText: 'Coba Lagi',
      didOpen: () => {
        const actions = Swal.getActions();
        actions.style.justifyContent = "center";
      }
    });

    console.error(customMsg);
    console.error(errorObject);
  };

  return (
    <div>
      <div className="container-main-layout" >

        <div className="content">

          <h2>Daftar Akun Baru</h2>

          <div className="container-form">
            <form onSubmit={registerUser}>

              <input
                type="text"
                placeholder="Nama Pengguna"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">-- Pilih Role --</option>
                <option value="0">Admin</option>
                <option value="1">Buyer</option>
              </select>

              <button type="submit" disabled={loader}>
                {loader ? "Memproses..." : "Register"}
              </button>
            </form>

            <p className="register">
              Sudah punya akun? <a href="/login">Login di sini.</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
