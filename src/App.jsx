import { useState, useEffect } from "react";
import axios from "axios";

import "./assets/style.css";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // --- 狀態定義 ---
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]); // 初始為空陣列
  const [tempProduct, setTempProduct] = useState(null);

  // 靜態範例資料 (來自程式碼 2)
  const defaultProducts = [
    {
      category: "甜甜圈",
      content: "尺寸：14x14cm",
      description:
        "濃郁的草莓風味，中心填入滑順不膩口的卡士達內餡，帶來滿滿幸福感！",
      id: "-L9tH8jxVb2Ka_DYPwng",
      is_enabled: 1,
      origin_price: 150,
      price: 99,
      title: "草莓莓果夾心圈",
      unit: "元",
      imageUrl: "https://images.unsplash.com/photo-1583182332473-b31ba08929c8",
      imagesUrl: [
        "https://images.unsplash.com/photo-1626094309830-abbb0c99da4a",
        "https://images.unsplash.com/photo-1559656914-a30970c1affd",
      ],
    },
    {
      category: "蛋糕",
      content: "尺寸：6寸",
      description:
        "蜜蜂蜜蛋糕，夾層夾上酸酸甜甜的檸檬餡，清爽可口的滋味讓人口水直流！",
      id: "-McJ-VvcwfN1_Ye_NtVA",
      is_enabled: 1,
      origin_price: 1000,
      price: 900,
      title: "蜂蜜檸檬蛋糕",
      unit: "個",
      imageUrl:
        "https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1001&q=80",
      imagesUrl: [
        "https://images.unsplash.com/photo-1618888007540-2bdead974bbb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=987&q=80",
      ],
    },
    {
      category: "蛋糕",
      content: "尺寸：6寸",
      description: "法式煎薄餅加上濃郁可可醬，呈現經典的美味及口感。",
      id: "-McJ-VyqaFlLzUMmpPpm",
      is_enabled: 1,
      origin_price: 700,
      price: 600,
      title: "暗黑千層",
      unit: "個",
      imageUrl:
        "https://images.unsplash.com/photo-1505253149613-112d21d9f6a9?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDZ8fGNha2V8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60",
      imagesUrl: [
        "https://images.unsplash.com/flagged/photo-1557234985-425e10c9d7f1?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTA5fHxjYWtlfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60",
        "https://images.unsplash.com/photo-1540337706094-da10342c93d8?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDR8fGNha2V8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=60",
      ],
    },
  ];

  // --- 自動化與初始化 ---

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
      checkAdmin();
    }
  }, []);

  useEffect(() => {
    if (isAuth) {
      getData();
    }
  }, [isAuth]);

  // --- 函式邏輯 ---

  const checkAdmin = async () => {
    try {
      await axios.post(`${API_BASE}/api/user/check`);
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
    }
  };

  const getData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      // 如果 API 有產品，則使用 API 資料；若無，則使用範例資料
      const apiProducts = response.data.products;
      setProducts(apiProducts.length > 0 ? apiProducts : defaultProducts);
    } catch (error) {
      console.error("取得產品失敗：", error.response?.data?.message);
      // 若 API 請求失敗，也顯示範例資料方便開發
      setProducts(defaultProducts);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token}; expires=${new Date(
        expired * 1000
      )};`;
      axios.defaults.headers.common["Authorization"] = token;
      setIsAuth(true);
      alert("登入成功！");
    } catch (error) {
      alert(`登入失敗：${error.response?.data?.message || "請檢查帳號密碼"}`);
    }
  };

  const handleLogout = () => {
    document.cookie =
      "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    delete axios.defaults.headers.common["Authorization"];
    setFormData({ username: "", password: "" });
    setProducts([]);
    setTempProduct(null);
    setIsAuth(false);
    alert("已登出");
  };

  const checkLogin = async () => {
    try {
      await axios.post(`${API_BASE}/api/user/check`);
      alert("目前狀態：已登入");
    } catch (error) {
      alert("目前狀態：登入失效");
      setIsAuth(false);
    }
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={onSubmit}>
            <div className="form-floating mb-2">
              <input
                type="email"
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                autoComplete="off"
                required
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container mt-5">
          {/* 按鈕與標題區塊 */}
          <div className="row mb-4">
            <div className="col-md-7 text-center">
              <div className="d-flex justify-content-center gap-2 mb-3">
                <button className="btn btn-success" onClick={checkLogin}>
                  確認登入
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  登出
                </button>
              </div>
              <h2 className="text-center">產品列表</h2>
            </div>
          </div>

          <div className="row">
            {/* 左側：產品表格 */}
            <div className="col-md-7">
              <table className="table mt-3 text-center align-middle">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.title}</td>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>
                          <span
                            className={
                              product.is_enabled
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {product.is_enabled ? "啟用" : "未啟用"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setTempProduct(product)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">載入中或尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 右側：產品明細 */}
            <div className="col-md-5">
              <h3 className="text-center">產品明細</h3>
              {tempProduct ? (
                <div className="card mt-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top"
                    style={{ height: "300px", objectFit: "cover" }}
                    alt={tempProduct.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <del className="text-secondary">
                        {tempProduct.origin_price}
                      </del>
                      &nbsp;元 / {tempProduct.price} 元
                    </div>

                    <h5 className="mt-4">更多圖片</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="me-2 mb-2"
                          style={{ height: "100px" }}
                          alt={`圖片 ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary mt-3 text-center">
                  請選擇一個產品查看細節
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
