import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useNavigate } from 'react-router-dom';
import contractData from '../artifacts/deployment.json';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Products({ contract }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "List Products";
    if (contract) {
      fetchProducts();
    }
  }, [contract]);

  const fetchProducts = async () => {
    try {
      const data = await contract.getAllProducts();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      errAlert(err, "Gagal mengambil data produk");
    }
  };

  const handleAddProduct = async () => {
    const { value: formValues } = await MySwal.fire({
      title: 'Tambah Produk',
      html:
        `<input id="prodId" class="swal2-input" placeholder="Product ID (number)">` +
        `<input id="prodName" class="swal2-input" placeholder="Product Name">` +
        `<input id="prodPrize" class="swal2-input" placeholder="Product Prize (wei)">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const prodId = parseInt(document.getElementById('prodId').value);
        const prodName = document.getElementById('prodName').value;
        const prodPrize = parseInt(document.getElementById('prodPrize').value);

        if (!prodId || !prodName || !prodPrize) {
          Swal.showValidationMessage('Semua kolom harus diisi dan valid!');
          return;
        }

        return { prodId, prodName, prodPrize };
      }
    });

    if (formValues) {
      try {
        const tx = await contract.addProduct(
          formValues.prodId,
          formValues.prodName,
          formValues.prodPrize
        );
        await tx.wait();
        await fetchProducts();
        MySwal.fire('Sukses', 'Produk berhasil ditambahkan!', 'success');
      } catch (err) {
        errAlert(err, "Gagal menambahkan produk");
      }
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
    <div className={styles.containerMainLayout}>
      <h2>Daftar Produk</h2>
      <button onClick={handleAddProduct}>
        + Tambah Produk
      </button>

      {loading ? (
        <p>Memuat produk...</p>
      ) : (
        <div className={styles.cardContainer}>
          {products.map((item, index) => (
            <div className={styles.card} key={index}>
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
