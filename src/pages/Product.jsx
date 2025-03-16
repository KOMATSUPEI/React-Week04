import { useEffect,useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import ProductModal from "../components/ProductModal";
import DelProductModal from "../components/DelProductModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

const defaultModalState = {
  id:"",
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""],
};

function Product() {
    // Modal輸入值＆事件監聽
    const [tempProduct, setTempProduct] = useState(defaultModalState);//預設產品資訊
    // Modal開關狀態
    const [isProductModalOpen,setIsProductModalOpen]=useState(false);
    // DeleteModal開關狀態
    const [isDelProductModalOpen,setIsDelProductModalOpen]=useState(false);

    // 取得產品資料
    const getProducts = async (page) => {
        try {
        const res = await axios.get(
            `${BASE_URL}/v2/api/${API_PATH}/admin/products?page=${page}`
        );
        setProducts(res.data.products);
        setPageInfo(res.data.pagination);//分頁資訊
        } catch (error) {
        alert("取得產品失敗");
        }
    };

    useEffect(()=>{
        getProducts();
    },[])

    // 判斷當前動作是新增產品還是編輯產品
    const [modalMode,setModalMode]=useState(null);
    // 編輯產品狀態預設
    const [products, setProducts] = useState([]);

    //分頁邏輯
    const [pageInfo,setPageInfo]=useState({});
    
    const handlePageChange=(page)=>{
      getProducts(page);
    }

    // 開啟 Modal
    const handleOpenProductModal=(mode,product)=>{

    //點擊編輯or建立新的產品，傳入參數
    setModalMode(mode);

    // 判斷是新增還是編輯
    switch(mode){
        case "create":
            setTempProduct(defaultModalState);
            break;
        case "edit":
            setTempProduct({
                ...product,
                id: product.id || "",
                imageUrl: product.imageUrl || "",
                title: product.title || "",
                category: product.category || "",
                unit: product.unit || "",
                origin_price: product.origin_price || "",
                price: product.price || "",
                description: product.description || "",
                content: product.content || "",
                is_enabled: product.is_enabled || false,
                imagesUrl: product.imagesUrl || []
            });
            break;
        default:
            break;
    }
    setIsProductModalOpen(true);
    };

    // 開啟[刪除Modal]
    const handleOpenDelProductModal=(product)=>{
    setTempProduct(product);
    setIsDelProductModalOpen(true);
    };

  return (
    <>
    <div className="container py-5">
      <div className="row">
        <div className="col">
          <div className="d-flex justify-content-between">
          <h1>產品列表</h1>
          <button type="button" className="btn btn-primary" onClick={()=>handleOpenProductModal("create")}>建立新的產品</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row">{product.title}</th>
                  <td>{product.origin_price}</td>
                  <td>{product.price}</td>
                  <td>{product.is_enabled ? (<span className="text-success">啟用</span>) : (<span>未啟用</span>)}</td>
                  <td>
                  <div className="btn-group">
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>handleOpenProductModal("edit",product)}>編輯</button>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>handleOpenDelProductModal(product)}>刪除</button>
                  </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pageInfo={pageInfo} handlePageChange={handlePageChange}/>
      </div>
    </div>

    <ProductModal   
        tempProduct={tempProduct} 
        modalMode={modalMode} 
        isOpen={isProductModalOpen}
        setIsOpen={setIsProductModalOpen}
        getProducts={getProducts}
    />

    <DelProductModal
        tempProduct={tempProduct}
        isOpen={isDelProductModalOpen}
        setIsOpen={setIsDelProductModalOpen}
        getProducts={getProducts}
    />

    </>
  );
};

export default Product;