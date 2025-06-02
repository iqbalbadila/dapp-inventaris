// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SystemContracts {

    enum UserRole { ADMIN, BUYER }
    enum ProductStatus { AVAILABLE, SOLD_OUT }
    enum ProductType { ELECTRONICS, CLOTHING, FOOD, FURNITURE }
    enum OrderStatus { PENDING, COMPLETED }

    struct Product {
        string prodId;
        string prodName;
        uint8 prodType;
        string prodDetail;
        uint prodPrize;
        string prodSize;
    }

    struct ProductStock {
        string prodId;
        uint stock;
        string[] packageIds;
    }

    struct Package {
        string packageId;
        string prodId;
        string prodName;
        uint stock;
    }

    struct User {
        string userName;
        address userAddress;
        uint userRole;
    }

    struct Order {
        string orderId;
        string packageId;
        string productId;
        User buyer;
        uint status;
    }

    struct OutputListOrder {
        string prodId;
        string prodName;
        uint prodPrize;
        uint status;
    }

    struct OutputListPackage {
        string packageId;
        string prodId;
        string prodSize;
        string prodName;
        uint status;
        uint prodPrize;
    }

    struct OutputListProduct {
        string prodId;
        string prodName;
        uint prodPrize;
    }

    string[] public packageIds;

    mapping(string => string[]) public productListById;
    mapping(string => Order[]) public orderListByPackage;
    mapping(address => User) public userList;
    mapping(string => string[]) public packageIdByProdId;
    mapping(string => Product) public productDetail;
    mapping(string => Order) public orderDetail;
    mapping(string => Package) public packageDetail;

    event ProductAdded(string prodId, string prodName, uint8 jenis, string prodDetail, uint prodPrize, string prodSize);
    event OrderPlaced(string orderId, address user);
    event UserRegistered(string userName, address user, uint userRole);
    event PackageStockAdded(string prodId, uint stock);

    function userRegist(string memory _userName, uint _userRole) public {
        User memory newUser = User(_userName, msg.sender, _userRole);
        userList[msg.sender] = newUser;
        emit UserRegistered(newUser.userName, msg.sender, newUser.userRole);
    }

    function loginUser() public view returns (User memory) {
        return userList[msg.sender];
    }

    function addProduct(string memory _prodId, string memory _prodName, uint8 _jenis, string memory _prodDetail, uint _prodPrize, string memory _prodSize) public {
        Product memory newProduct = Product(_prodId, _prodName, _jenis, _prodDetail, _prodPrize, _prodSize);
        productDetail[_prodId] = newProduct;
        productListById[_prodId].push(_prodName);
        emit ProductAdded(_prodId, _prodName, _jenis, _prodDetail, _prodPrize, _prodSize);
    }

    function addStock(string memory _prodId, uint totalsProd, string[] memory _packageIds) public {
        require(totalsProd == _packageIds.length, "Jumlah package ID tidak cocok");

        for (uint i = 0; i < totalsProd; i++) {
            packageIdByProdId[_prodId].push(_packageIds[i]);

            Package memory newPackage = Package(
                _packageIds[i],
                _prodId,
                productDetail[_prodId].prodName,
                1
            );

            packageDetail[_packageIds[i]] = newPackage;
            packageIds.push(_packageIds[i]);
        }

        emit PackageStockAdded(_prodId, totalsProd);
    }

    function placeOrder(string memory orderId, string memory packageId, string memory productId) public {
        User memory buyer = userList[msg.sender];

        Order memory newOrder = Order(orderId, packageId, productId, buyer, uint(OrderStatus.PENDING));
        orderListByPackage[packageId].push(newOrder);
        orderDetail[orderId] = newOrder;
 
        emit OrderPlaced(orderId, msg.sender);  
    }

    function getProductDetail(string memory _prodId) public view returns (Product memory) {
        return productDetail[_prodId];
    }

    function getAllOrders() public view returns (OutputListOrder[] memory) {
        uint totalOrders = 0;

        for (uint i = 0; i < packageIds.length; i++) {
            totalOrders += orderListByPackage[packageIds[i]].length;
        }

        OutputListOrder[] memory result = new OutputListOrder[](totalOrders);
        uint index = 0;

        for (uint i = 0; i < packageIds.length; i++) {
            string memory packageId = packageIds[i];
            Order[] memory orders = orderListByPackage[packageId];
            for (uint j = 0; j < orders.length; j++) {
                string memory prodId = orders[j].productId;
                Product memory prod = productDetail[prodId];
                result[index++] = OutputListOrder(prodId, prod.prodName, prod.prodPrize, orders[j].status);
            }
        }

        return result;
    }

    function getAllProducts() public view returns (OutputListProduct[] memory) {
        uint total = 0;
        string[] memory uniqueProdIds = new string[](packageIds.length);

        for (uint i = 0; i < packageIds.length; i++) {
            string memory prodId = packageDetail[packageIds[i]].prodId;
            bool found = false;
            for (uint j = 0; j < total; j++) {
                if (keccak256(bytes(uniqueProdIds[j])) == keccak256(bytes(prodId))) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqueProdIds[total++] = prodId;
            }
        }

        OutputListProduct[] memory result = new OutputListProduct[](total);
        for (uint i = 0; i < total; i++) {
            Product memory prod = productDetail[uniqueProdIds[i]];
            result[i] = OutputListProduct(prod.prodId, prod.prodName, prod.prodPrize);
        }

        return result;
    }

    function getAllPackages() public view returns (OutputListPackage[] memory) {
        OutputListPackage[] memory result = new OutputListPackage[](packageIds.length);

        for (uint i = 0; i < packageIds.length; i++) {
            string memory id = packageIds[i];
            Package memory p = packageDetail[id];
            Product memory prod = productDetail[p.prodId];

            result[i] = OutputListPackage(
                p.packageId,
                p.prodId,
                prod.prodSize,
                p.prodName,
                0,
                prod.prodPrize
            );
        }

        return result;
    }

    function getUserDetail(address sender) public view returns (User memory) {
        return userList[sender];
    }
}
