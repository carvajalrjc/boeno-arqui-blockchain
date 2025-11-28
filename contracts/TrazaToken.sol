// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TrazaToken (TRZ)
 * @dev Token ERC-20 para el Sistema de Trazabilidad
 * Se otorgan tokens como recompensa por registrar movimientos verificados
 */
contract TrazaToken {
    string public name = "TrazaToken";
    string public symbol = "TRZ";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    address public owner;
    address public trazabilidadContract;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Eventos ERC-20
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // Eventos adicionales
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede ejecutar esto");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == trazabilidadContract,
            "No autorizado"
        );
        _;
    }
    
    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        totalSupply = _initialSupply * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    /**
     * @dev Establece la dirección del contrato de trazabilidad
     */
    function setTrazabilidadContract(address _contract) external onlyOwner {
        trazabilidadContract = _contract;
    }
    
    /**
     * @dev Transferir tokens
     */
    function transfer(address _to, uint256 _value) external returns (bool) {
        require(_to != address(0), "Direccion invalida");
        require(balanceOf[msg.sender] >= _value, "Saldo insuficiente");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    /**
     * @dev Aprobar gasto de tokens
     */
    function approve(address _spender, uint256 _value) external returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    /**
     * @dev Transferir desde una cuenta aprobada
     */
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
        require(_to != address(0), "Direccion invalida");
        require(balanceOf[_from] >= _value, "Saldo insuficiente");
        require(allowance[_from][msg.sender] >= _value, "Allowance insuficiente");
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    /**
     * @dev Mintear tokens como recompensa (solo autorizado)
     */
    function mint(address _to, uint256 _amount, string memory _reason) external onlyAuthorized {
        require(_to != address(0), "Direccion invalida");
        
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        
        emit Transfer(address(0), _to, _amount);
        emit TokensMinted(_to, _amount, _reason);
    }
    
    /**
     * @dev Quemar tokens propios
     */
    function burn(uint256 _amount) external {
        require(balanceOf[msg.sender] >= _amount, "Saldo insuficiente");
        
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        
        emit Transfer(msg.sender, address(0), _amount);
        emit TokensBurned(msg.sender, _amount);
    }
}

