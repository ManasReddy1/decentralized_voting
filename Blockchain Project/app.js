// app.js
// Initialize Web3 instance
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

// Contract ABI and address (replace with your contract details)
const contractABI = [...]; // Replace with your contract ABI
const contractAddress = '0x...'; // Replace with your contract address

// Create contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to connect to Metamask
async function connectToMetamask() {
  // Check if Metamask is installed
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request access to user's Metamask accounts
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get the user's Ethereum accounts
      const accounts = await web3.eth.getAccounts();

      // Update UI or perform actions with the connected account(s)
      console.log('Connected account:', accounts[0]);
    } catch (error) {
      console.error('Error connecting to Metamask:', error);
    }
  } else {
    console.error('Metamask is not installed or enabled.');
  }
}

// Function to populate candidates in the dropdown
async function populateCandidates() {
    const candidatesCount = await contract.methods.getCandidatesCount().call();
    const candidates = $('#candidates');
    candidates.empty();

    for (let i = 0; i < candidatesCount; i++) {
        const candidate = await contract.methods.candidates(i).call();
        candidates.append(`<option value="${i}">${candidate.name}</option>`);
    }
}

// Function to handle voting
$('#voteButton').click(async () => {
    const candidateId = $('#candidates').val();
    const accounts = await web3.eth.getAccounts();
    await contract.methods.vote(candidateId).send({ from: accounts[0] });
    alert('Vote submitted successfully!');
});

// Function to display voting results
async function displayResults() {
    const candidatesCount = await contract.methods.getCandidatesCount().call();
    const resultsList = $('#resultsList');
    resultsList.empty();

    for (let i = 0; i < candidatesCount; i++) {
        const candidate = await contract.methods.candidates(i).call();
        const voteCount = candidate.voteCount;
        resultsList.append(`<li class="list-group-item">${candidate.name}: ${voteCount} votes</li>`);
    }

    // Sort results in descending order
    const listItems = resultsList.children('li').get();
    listItems.sort((a, b) => $(b).text().split(':')[1].trim() - $(a).text().split(':')[1].trim());
    resultsList.empty().append(listItems);
}

// Call functions on page load
$(document).ready(async () => {
    await populateCandidates();

    if (window.location.pathname.includes('results.html')) {
        await displayResults();
    }
});

// Add event listener for "Connect to Metamask" button
document.getElementById('connectMetamaskButton').addEventListener('click', connectToMetamask);