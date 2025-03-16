import { useEffect,useState,useRef } from "react";
import axios from "axios";
import { Modal } from 'bootstrap';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({ modalMode,tempProduct,isOpen,setIsOpen,getProducts }) {

    const [modalData,setModalData]=useState(tempProduct);

    useEffect(()=>{
        setModalData({...tempProduct});
    },[tempProduct])

    // 透過 useRef 取得 DOM
    const productModalRef=useRef(null);

    // 建立 Modal 實例（頁面渲染後才取得 DOM）
    useEffect(()=>{
        new Modal(productModalRef.current,{backdrop:false});//點擊背景不關閉
    },[])

    // Modal開關邏輯
    useEffect(()=>{
        const modalInstance=Modal.getInstance(productModalRef.current);
        modalInstance.show();
    },[isOpen])

    // 關閉 Modal
    const handleCloseProductModal=()=>{
        const modalInstance=Modal.getInstance(productModalRef.current);
        modalInstance.hide();
        setIsOpen(false);
    };

    const handleModalInputChange=(e)=>{
        const {value,name,checked,type}=e.target;
    
        setModalData({
            ...modalData,
            [name]:type === "checkbox" ? checked : value
        })//針對checkbox做判斷
        };
    
    // 副圖處理
    const handleImageChange=(e,index)=>{
    const {value}=e.target;
    const newImages=[...modalData.imagesUrl];
    
    newImages[index]=value;
    setModalData({
        ...modalData,
        imagesUrl:newImages
    })
    }
    
    // 新增&刪除副圖
    const handleAddImage=()=>{
    const newImages=[...modalData.imagesUrl,""];
    
    setModalData({
        ...modalData,
        imagesUrl:newImages
    })
    }
    
    const handleRemoveImage=()=>{
    const newImages=[...modalData.imagesUrl];
    
    newImages.pop();//移除最後一個欄位
    setModalData({
        ...modalData,
        imagesUrl:newImages
    })
    }

    //新增產品
    const createProduct=async()=>{
        try{    
            await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`,{
            data:{
                ...modalData,
                origin_price:Number(modalData.origin_price),
                price:Number(modalData.price),
                is_enabled:modalData.is_enabled ? 1 : 0,
            }
            });
        }catch(error){
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message.join("\n")); 
            } else {
                alert("發生錯誤，請稍後再試！");
            }
            console.log(error);
        } 
        }

    //編輯產品
    const updateProduct=async()=>{
    try{
        await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${modalData.id}`,{
        data:{
            ...modalData,
            origin_price:Number(modalData.origin_price),
            price:Number(modalData.price),
            is_enabled:modalData.is_enabled ? 1 : 0
        }
        });
    }catch(error){
        alert("產品編輯失敗！");
        console.log(error);
        //modalInstance.show()
    } 
    }

    //按下 [確認]後新增產品
    const handleUpdateProduct=async()=>{
    const apiCall = modalMode === "create" ? createProduct : updateProduct;

    try{
        await apiCall();
        getProducts();//重新渲染新產品畫面
        handleCloseProductModal();//關閉Modal
    }catch(error){
        alert("產品更新失敗！");
        console.log(error);
    }
    }

    //圖片上傳邏輯
    const handleFileChange=async(e)=>{
    const file=e.target.files[0];
    const formData=new FormData();
    formData.append("file-to-upload",file);
    
    try{
        const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/upload`, formData);
        const uploadedImageUrl=res.data.imageUrl;

        setModalData({
        ...modalData,
        imageUrl:uploadedImageUrl
        })
    }catch(err){
        console.log(err);
    }
    }

  return (<>
    {/* ProductModal */}
    {/* 綁定 useRef 取得 DOM */}
    <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom">
                {/* 判斷當前動作是新增產品還是編輯產品 */}
                <h5 className="modal-title fs-4">{modalMode === "create" ? "新增產品" : "編輯產品"}</h5>
                {/* Ｘ取消 */}
                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseProductModal}></button>
                </div>

                <div className="modal-body p-4">
                <div className="row g-4">
                    <div className="col-md-4">
                    {/* 圖片上傳 */}
                    <div className="mb-5">
                        <label htmlFor="fileInput" className="form-label"> 圖片上傳 </label>
                        <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="form-control"
                        id="fileInput"
                        onChange={handleFileChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="primary-image" className="form-label">
                        主圖
                        </label>
                        <div className="input-group">
                        <input
                            value={modalData.imageUrl}//綁定modalData
                            onChange={handleModalInputChange}
                            name="imageUrl"
                            type="text"
                            id="primary-image"
                            className="form-control"
                            placeholder="請輸入圖片連結"
                        />
                        </div>
                        <img
                        src={modalData.imageUrl}//綁定modalData
                        alt={modalData.title}
                        className="img-fluid"
                        />
                    </div>

                    {/* 副圖 */}
                    <div className="border border-2 border-dashed rounded-3 p-3">
                        {modalData.imagesUrl?.map((image, index) => (
                        <div key={index} className="mb-2">
                            <label
                            htmlFor={`imagesUrl-${index + 1}`}
                            className="form-label"
                            >
                            副圖 {index + 1}
                            </label>
                            <input
                            value={image}
                            onChange={(e)=>handleImageChange(e,index)}
                            id={`imagesUrl-${index + 1}`}
                            type="text"
                            placeholder={`圖片網址 ${index + 1}`}
                            className="form-control mb-2"
                            />
                            {image && (
                            <img
                                src={image}
                                alt={`副圖 ${index + 1}`}
                                className="img-fluid mb-2"
                            />
                            )}
                        </div>
                        ))}
                        {/* 副圖新增＆取消按鈕 */}
                        <div className="btn-group w-100">
                        {(modalData.imagesUrl.length<5) && (modalData.imagesUrl[modalData.imagesUrl.length-1]!=="") && (<button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}
                        {(modalData.imagesUrl.length>1) && (<button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>)}
                        </div>
                    </div>
                    </div>

                    <div className="col-md-8">
                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">
                        標題
                        </label>
                        <input
                        value={modalData.title}//綁定modalData
                        onChange={handleModalInputChange}
                        name="title"
                        id="title"
                        type="text"
                        className="form-control"
                        placeholder="請輸入標題"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="category" className="form-label">
                        分類
                        </label>
                        <input
                        value={modalData.category}//綁定modalData
                        onChange={handleModalInputChange}
                        name="category"
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="unit" className="form-label">
                        單位
                        </label>
                        <input
                        value={modalData.unit}//綁定modalData
                        onChange={handleModalInputChange}
                        name="unit"
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        />
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-6">
                        <label htmlFor="origin_price" className="form-label">
                            原價
                        </label>
                        <input
                            value={modalData.origin_price}//綁定modalData
                            onChange={handleModalInputChange}
                            name="origin_price"
                            id="origin_price"
                            type="number"
                            className="form-control"
                            placeholder="請輸入原價"
                        />
                        </div>
                        <div className="col-6">
                        <label htmlFor="price" className="form-label">
                            售價
                        </label>
                        <input
                            value={modalData.price}//綁定modalData
                            onChange={handleModalInputChange}
                            name="price"
                            id="price"
                            type="number"
                            className="form-control"
                            placeholder="請輸入售價"
                        />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                        產品描述
                        </label>
                        <textarea
                        value={modalData.description}//綁定modalData
                        onChange={handleModalInputChange}
                        name="description"
                        id="description"
                        className="form-control"
                        rows={4}
                        placeholder="請輸入產品描述"
                        ></textarea>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="content" className="form-label">
                        說明內容
                        </label>
                        <textarea
                        value={modalData.content}//綁定modalData
                        onChange={handleModalInputChange}
                        name="content"
                        id="content"
                        className="form-control"
                        rows={4}
                        placeholder="請輸入說明內容"
                        ></textarea>
                    </div>

                    <div className="form-check">
                        <input
                        checked={modalData.is_enabled}//綁定modalData
                        onChange={handleModalInputChange}
                        name="is_enabled"
                        type="checkbox"
                        className="form-check-input"
                        id="isEnabled"
                        />
                        <label className="form-check-label" htmlFor="isEnabled">
                        是否啟用
                        </label>
                    </div>
                    </div>
                </div>
                </div>

                <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-secondary" onClick={handleCloseProductModal}>
                    取消
                </button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateProduct}>
                    確認
                </button>
                </div>
            </div>
        </div>
    </div>
    </>);
}

export default ProductModal;