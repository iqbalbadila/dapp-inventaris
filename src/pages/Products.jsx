import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useNavigate } from 'react-router-dom';
import contractData from '../artifacts/deployment.json';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Products() {
  const [products, setProducts] = useState([]);
    const [signer, setSigner] = useState("");
  const [contract, setContract] = useState();
  const [loading, setLoading] = useState(true);

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
  useEffect(() => {
    document.title = "List Products";
    if (contract) {
      fetchProducts();
    }
  }, [contract]);


  const fetchProducts = async () => {
    try {
      const data = await contract.getAllProducts();
      console.log("Fetched products:", data);
      setProducts(data);
      setLoading(false);
    } catch (err) {
      errAlert(err, "Gagal mengambil data produk");
    }
  };


  const handleAddProduct = async () => {
    const { value: formValues } = await MySwal.fire({
      title: 'Tambah Produk',
      html: `
        <input id="productName" class="swal2-input" placeholder="Nama Produk">
        <select id="productType" class="swal2-select">
          <option value="" disabled selected>Pilih Jenis Produk</option>
          <option value="0">Elektronik</option>
          <option value="1">Pakaian</option>
          <option value="2">Makanan</option>
          <option value="3">Furniture</option>
        </select>
        <input id="productSize" class="swal2-input" placeholder="Ukuran Produk (contoh: 10x20cm)">
        <input id="productPrice" class="swal2-input" type="number" placeholder="Harga (angka)">
        <textarea id="productDetail" class="swal2-textarea" placeholder="Detail Produk"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      preConfirm: () => {
        const name = document.getElementById('productName').value;
        const type = document.getElementById('productType').value;
        const size = document.getElementById('productSize').value;
        const price = document.getElementById('productPrice').value;
        const detail = document.getElementById('productDetail').value;

        if (!name || !type || !size || !price || !detail) {
          Swal.showValidationMessage('Semua field harus diisi!');
          return;
        }

const timestamp = Date.now();
const productId = `ID-${timestamp}-${name.replace(/\s+/g, '-')}`;


      return {
        productId,
        name,
        type,
        size,
        price: parseInt(price),
        detail
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      addProduct(
        result.value.productId,
        result.value.name,
        parseInt(result.value.type),
        result.value.size,
        parseInt(result.value.price),
        result.value.detail
      );
    }
  });
};

const addProduct = async (productId, name, type, size, price, detail) => {
  try {
    setLoading(true);

    console.log("Adding product:", {
      productId,
      name,
      type,
      detail,
      price,
      size,
    });

    const tx = await contract.addProduct(
      productId,
      name,
      type,
      detail,
      price,
      size,
    );

    await tx.wait();
    MySwal.fire({
      title: 'Produk berhasil ditambahkan!',
      icon: 'success',
      confirmButtonText: 'OK',
      didOpen: () => {
        const actions = Swal.getActions();
        actions.style.justifyContent = "center";
      }
    });

    fetchProducts();
  } catch (err) {
    errAlert(err, "Gagal menambah produk");
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
  <div className='container-main-layout'>
    <h2>Daftar Produk</h2>
    <button onClick={handleAddProduct}>
      + Tambah Produk
    </button>

    {loading ? (
      <p>Memuat produk...</p>
    ) : (
      <div className='product-list'>
        {products.map((item, index) => (
          <div className='card' key={index}>
            <h3>{item.prodName}</h3>
            <p><strong>ID:</strong> {item.prodId}</p>
            <p><strong>Harga:</strong> {item.prodPrize} wei</p>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
