

const app = angular.module('bugetifyApp', [])
// angular.module('bugetifyApp', [])


const API_BASE_URL = 'http://127.0.0.1:8000/transaction';


app.controller('MainController', function($scope) {

    $scope.customer = JSON.parse(localStorage.getItem('customer'))
    $scope.customer_id = JSON.parse(localStorage.getItem('customer')).id;
    $scope.formType = 'credit';

    // $scope.stats = {
    //     total: 45230.50,
    //     deposit: 75000.00,
    //     expense: 29769.50
    // };


    $scope.customer_logout = function(){
        console.log("in logout funstion")
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('customer')

        // showAlert('Logged Successfully', 'success')
        window.location.href = '../index.html'
    }

});

app.controller('TransactionController', function($scope, $http) {

    $scope.customer = JSON.parse(localStorage.getItem('customer'));
    $scope.customer_id = JSON.parse(localStorage.getItem('customer')).id;
    $scope.formType = 'credit';

    $scope.stats = {
        total_balance: 0,
        deposit: 0,
        expense: 0
    };

    // Set the initial goal amount (₹20,000) and initialize the total expenses
    $scope.goalAmount = 20000;  // Initial goal amount (₹20,000)
    $scope.totalExpense = 0;     // This will store the total expenses

    // Initialize for tracking whether the user is editing the goal
    $scope.isEditingGoal = false;

    $scope.newTransaction = {};
    $scope.transactions = [];

    // Fetch transactions from the API
    $scope.getTransaction = function () {
        // Your API call
        $http.get(`${API_BASE_URL}/transactions/${$scope.customer_id}/`)
            .then(function (response) {
                console.log(response.data);
                $scope.transactions = response.data;
                $scope.getStats();  // Calculate stats after loading the transactions
            })
            .catch(function (error) {
                // Handle error
                console.error("Error fetching transactions:", error);
                $scope.errorMessage = "Sorry, there was an issue loading your transactions. Please try again later.";
            });
    };

    // Calculate stats based on the transactions
    $scope.getStats = function () {
        // Initialize totals to 0
        $scope.stats.total_balance = 0;
        $scope.stats.deposit = 0;
        $scope.stats.expense = 0;
        $scope.totalExpense = 0;

        console.log("getStats called");

        // Loop through each transaction and calculate totals
        $scope.transactions.forEach(function (transaction) {
            // For deposits (Credit), add to the deposit amount
            if (transaction.credit_amt > 0) {
                $scope.stats.deposit += transaction.credit_amt;
                // Total balance increases by the deposit amount
                $scope.stats.total_balance += transaction.credit_amt;
            }
            
            // For expenses (Debit), add to the expense amount
            if (transaction.debit_amt > 0) {
                $scope.stats.expense += transaction.debit_amt;
                $scope.totalExpense += transaction.debit_amt; // Track total expenses
                // Total balance decreases by the expense amount
                $scope.stats.total_balance -= transaction.debit_amt;
            }
        });

        // Recalculate the progress ring and remaining balance
        $scope.calculateProgress();
        $scope.remainingBalance = $scope.goalAmount - $scope.totalExpense;
    };

    // Function to calculate the progress ring's stroke-dasharray and stroke-dashoffset
    $scope.calculateProgress = function () {
        // Radius of the circle
        const radius = 45;
        const circumference = 2 * Math.PI * radius;  // Circumference of the circle

        // Calculate the percentage of expenses towards the goal
        let expensePercentage = Math.min($scope.totalExpense / $scope.goalAmount, 1);  // Limit to 100%

        // Calculate the dash offset
        let dashOffset = circumference * (1 - expensePercentage);

        // Assign the calculated values to scope for use in the view
        $scope.circumference = circumference;
        $scope.dashOffset = dashOffset;
    };

    // Function to toggle the goal amount edit mode
    $scope.editGoal = function () {
        $scope.isEditingGoal = true;
    };

    // Function to save the goal amount after editing
    $scope.saveGoal = function () {
        $scope.isEditingGoal = false;
        // After saving, recalculate the stats and progress
        $scope.getStats();
    };

    // Function to add a new transaction
    $scope.addTransaction = function () {
        var transaction = {
            id: $scope.newTransaction.id,
            description: $scope.newTransaction.description,
            type: $scope.newTransaction.type,
            amount: parseFloat($scope.newTransaction.amount),
            time: new Date().toLocaleString('en-IN')
        };

        // Add transaction to the beginning of the array
        $scope.transactions.unshift(transaction);

        // Update stats based on the new transaction type
        if (transaction.type === 'Credit') {
            $scope.stats.deposit += transaction.amount;
            $scope.stats.total_balance += transaction.amount;
        } else {
            $scope.stats.expense += transaction.amount;
            $scope.stats.total_balance -= transaction.amount;
        }

        // Reset newTransaction object
        $scope.newTransaction = {};
        $scope.getStats(); // Recalculate stats after adding the transaction
    };

    // Watch the form type to automatically update the transaction type
    $scope.$watch('formType', function(val) {
        $scope.newTransaction.type = val === 'credit' ? 'Credit' : 'Debit';
    });

    // Call on controller load (page refresh)
    $scope.getTransaction();

});
