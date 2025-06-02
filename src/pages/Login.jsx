import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useNavigate } from 'react-router-dom';
import contractData from '../artifacts/deployment.json';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


const MySwal = withReactContent(Swal);

export default function Login() {

  const [name, setName] = useState("");
  const [signer, setSigner] = useState("");
  const [contract, setContract] = useState();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    document.title = "Welcome!"; 
  }, []);

  useEffect(() => {
    async function connectWallet() {
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          console.log(signer)
          const contr = new Contract(
            contractData.address, 
            contractData.abi, 
            signer);

          setContract(contr);
          setSigner(signer)
          console.log(contr);
        } catch (err) {
          console.error("User denied access: ", err);
          errAlert(err)
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
  
  const loginUs = async (e) => {
    e.preventDefault();
    setLoader(true)

    try {
      const loginCt = await contract.loginUser();
      console.log('loginCt', loginCt);
      
      const [userName, userAddr, role] = loginCt;
      
      if (signer.address === userAddr) {
        console.log('role pas login',{role, userAddr});

        let userdata;

        if (role === 0n) {
          userdata = {
            address: userAddr,
            name: userName,
            role:'Admin',
          }

        } else {
          userdata = {
            address: userAddr,
            name: userName,
            role: "Pembeli",
          }
  
        }
        sessionStorage.setItem("userdata", JSON.stringify(userdata))
        console.log(userdata);

        MySwal.fire({
          title: "Login  Berhasil",
          html: `<div>
                  <p>Harap tunggu sebentar, Anda sedang dialihkan ke halaman yang dituju <span>&#127939;</span></p>
                </div>`,
          timer: 2000,
          icon: 'success',
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
          allowOutsideClick: false,
        })
        .then(() => {
          if (userdata.role === "Admin") {
            navigate('/packages');
          } else if (userdata.role  === "Pembeli") {
            navigate('/packages');
          } else{
            navigate('/unauthorized');
          }
        });
        
      } else {
        errAlert({reason: "Nama Pengguna tidak ditemukan"}, "Harap masukan nama pengguna yang sesuai")
        setLoader(false);
      }
      
    } catch (err) {
      setLoader(false);
      errAlert(err, "Failed to login!");
    }
  }; 
  

  const errAlert = (err, customMsg) =>{
    
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
  }

  return (
    <div>
      <div className="container-main-layout" >

        <div className="content">

          <h2>Selamat Datang di Toko</h2>

          <div className="container-form">
            <form onSubmit={loginUs}>
              <input 
                type="text"
                placeholder="Nama Pengguna" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
              <button type="submit" disabled={loader}>
                {loader ? "Memproses..." : "Login"}
              </button>
            </form>


            <p className="register">
              Belum punya akun? <a href="/register">Silahkan daftar disini.</a>
            </p>
        </div>

        </div>
      </div>
    </div>
  );
}
