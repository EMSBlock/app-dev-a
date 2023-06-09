import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import contractData from "../contract-artifacts/contract-data.json";
import contractAddress from "../contract-artifacts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { CreateNotification } from "./CreateNotification";
import { GetNotifications } from "./GetNotifications";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { BuildNotificationsList } from "./BuildNotificationsList";
import { NoTokensMessage } from "./NoTokensMessage";



// This is the default id used by the Hardhat Network
const HARDHAT_NETWORK_ID = '31337';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      notifications_list: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install a wallet.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    // if (!this.state.tokenData || !this.state.balance) {
    //   return <Loading />;
    // }
    
    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              Voting Contract Web Interface
            </h1>
            <p>
              Welcome <b>{this.state.selectedAddress}</b>
            </p>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
            {/* 
              Sending a transaction isn't an immediate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
            {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">

            {/*
              This component displays a form that the user can use to send a 
              transaction and transfer some tokens.
              The component doesn't have logic, it just calls the transferTokens
              callback.
            */}
            {(
              <CreateNotification
                createNotification={(_note) =>
                  this._create_notification(_note)
                }
              />
            )}
          </div>
        </div>
        
        <div className="row">
          <div className="col-12">
            {(
              <GetNotifications 
                notifications={this.state.notifications_list}
                submitVote={(_id) =>
                  this._submit_vote(_id)
                }
              />
            )}

            <h4>Notifications List</h4>
            <table id="notifications-list">
              <thead>
                  <tr>
                      <td>Title</td>
                      <td>Votes</td>
                      <td>Creator</td>
                      <td>Consensus</td>
                      <td>Click</td>
                  </tr>
              </thead>
              <tbody id="notifications-table"></tbody>
            </table>
          </div>          
        </div>        
      </div>
    );
  }

  // componentWillUnmount() {
  //   // We poll the user's balance, so we have to stop doing that when Dapp
  //   // gets unmounted
  //   //this._stopPollingData();
  // }

  async setCookie(cname, cvalue, ex_mins) {
    const d = new Date();
    d.setTime(d.getTime() + (ex_mins*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  async getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Once we have the address, we can initialize the application.

    // First we check the network
    this._checkNetwork();
    
    this._initialize(selectedAddress);
    
    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      //this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
    });
    this._get_notification();
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();    
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);
    // Then, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._voting = new ethers.Contract(
      contractAddress.contract_address,
      contractData.abi,
      this._provider.getSigner(0)
    );
  }


  

  async _get_notification() {
    //var message = "No notifications";
    const messages = [];
    var notification = 0;
    var note = "Missing Notification"
    let x = 0;
    try {
      try {
        x = await this._voting.notificationsCount();
        if (x > 0) {
          for (let i = 0; i < x; i++) {
            messages.push(await this._voting.notifications(i));
          }
        }
      } catch (error) {
        messages.push("Problem")
      } finally {
        //document.getElementById("resultDiv").innerHTML = messages;
      }
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
      this.setState({notifications_list: messages});
    }
  }

  async _create_notification(_note) {
    if (this.txBeingSent === undefined) {
      this.setState({txBeingSent: true})
      try{
        this._voting.add_notification(_note.toString()).then(() => {
          this._get_notification();
        });
      } catch (error) {
        // We check the error code to see if this error was produced because the
        // user rejected a tx. If that's the case, we do nothing.
        if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
          return;
        }
        // Other errors are logged and stored in the Dapp's state. This is used to
        // show them to the user, and for debugging.
        console.error(error);
        this.setState({ transactionError: error });
      } finally {
        // If we leave the try/catch, we aren't sending a tx anymore, so we clear
        // this part of the state.
        this.setState({ txBeingSent: undefined });
        
      }
    }
  }


  async _submit_vote(_id) {
    if (this.txBeingSent === undefined) {
      this.setState({txBeingSent: true})
      try{
        await this._voting.vote(_id);
      } catch (error) {
        // We check the error code to see if this error was produced because the
        // user rejected a tx. If that's the case, we do nothing.
        if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
          return;
        }
        // Other errors are logged and stored in the Dapp's state. This is used to
        // show them to the user, and for debugging.
        console.error(error);
        this.setState({ transactionError: error });
      } finally {
        // If we leave the try/catch, we aren't sending a tx anymore, so we clear
        // this part of the state.
        this.setState({ txBeingSent: undefined });
        this._get_notification();
      }
    }
  }

  async _notifications_folder() {
    //const fs = require("../../../node_modules/fs-extra/lib/fs");
    //const path = require("path");
    // const dir_notification_artifacts = path.join(__dirname, "..", "notification_artifacts");
    // if (!fs.existsSync(dir_notification_artifacts)) {
    //   fs.mkdirSync(dir_notification_artifacts);
    // }
  }





  // ERROR CATCHERS



  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  async _switchChain() {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    await this._initialize(this.state.selectedAddress);
  }

  // This method checks if the selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      this._switchChain();
    }
  }
}
