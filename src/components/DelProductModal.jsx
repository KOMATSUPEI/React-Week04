import { useEffect,useRef } from "react";
import axios from "axios";
import { Modal } from 'bootstrap';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function DelProductModal({ tempProduct,isOpen,setIsOpen,getProducts }){

    // 透過 useRef 取得 DOM
    const delProductModalRef=useRef(null);

    // 建立[刪除Modal實例]
    useEffect(()=>{
        new Modal(delProductModalRef.current,{backdrop:false});
    },[])

    // 開啟[刪除Modal]
    useEffect(()=>{
        const modalInstance=Modal.getInstance(delProductModalRef.current);
        if(isOpen){
            const modalInstance=Modal.getInstance(delProductModalRef.current);
            modalInstance.show();
        }
    }
    ,[isOpen])

    //按下刪除Modal[刪除]後刪除產品
    const handleDeleteProduct=async()=>{
        try{
            await deleteProduct();
            getProducts();//重新渲染新產品畫面
            handleCloseDelProductModal();//關閉Modal
        }catch(error){
            alert("產品刪除失敗！");
        }
    }

    //[刪除Modal]刪除產品
    const deleteProduct=async()=>{
        try{
            await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`);
        }catch(error){
            alert("產品編輯失敗！");
        } 
    }

    // 關閉[刪除Modal]
    const handleCloseDelProductModal=()=>{
    const modalInstance=Modal.getInstance(delProductModalRef.current);
    // modalInstance.hide();
    setIsOpen(false);
    };

    return (<>
    {/* 刪除產品Modal  */}
    <div ref={delProductModalRef} className="modal fade" id="delProductModal" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">刪除產品</h1>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        onClick={handleCloseDelProductModal}
                    ></button>
                </div>
                <div className="modal-body">
                你是否要刪除 
                <span className="text-danger fw-bold">{tempProduct.title}</span>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCloseDelProductModal}
                    >
                        取消
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleDeleteProduct}>
                        刪除
                    </button>
                </div>
            </div>
        </div>
    </div>
    </>);
}

export default DelProductModal;