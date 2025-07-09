# Supplies - MJO Dashboard

## Table of Contents

1. [Overview](#overview)
2. [Purpose and Functionality](#purpose-and-functionality)
3. [Screenshots](#screenshots)
4. [Key Features](#key-features)
   - [Real-Time Inventory Tracking](#1-real-time-inventory-tracking)
   - [Searchable Supply Database](#2-searchable-supply-database)
   - [Shopping Cart System](#3-shopping-cart-system)
   - [Checkout Process](#4-checkout-process)
   - [User Session Management](#5-user-session-management)
5. [User Interface Components](#user-interface-components)
   - [Supply Display](#supply-display)
   - [Cart Interface](#cart-interface)
   - [Action Controls](#action-controls)
6. [Benefits for Staff](#benefits-for-staff)
   - [Inventory Management](#inventory-management)
   - [Client Service Enhancement](#client-service-enhancement)
   - [Administrative Efficiency](#administrative-efficiency)
7. [AppSheet Configuration](#appsheet-configuration)
   - [View Configuration](#view-configuration)
   - [Cart System Implementation](#cart-system-implementation)
   - [Inventory Tracking System](#inventory-tracking-system)
   - [Technical Implementation Notes](#technical-implementation-notes)
8. [Best Practices](#best-practices)
   - [For Staff Usage](#for-staff-usage)
   - [For Inventory Management](#for-inventory-management)

---

## Overview

The Supplies feature is a real-time inventory management system that allows staff to check availability and check out items for clients. This streamlined supply distribution system maintains accurate inventory levels while providing a user-friendly interface for staff to quickly locate and distribute necessary supplies to participants.

[↑ Jump to top](#table-of-contents)

## Purpose and Functionality

The Supplies system functions as a centralized inventory management tool where staff can view real-time supply availability, search for specific items, and check out supplies for client distribution. It eliminates inventory confusion and ensures accurate tracking of supply distribution across all staff members.

[↑ Jump to top](#table-of-contents)

## Screenshots

![Supplies Main View](../images/supplies.png)
*Main supplies interface showing inventory levels with search and cart functionality*

[↑ Jump to top](#table-of-contents)

## Key Features

### 1. **Real-Time Inventory Tracking**
- Live inventory level updates across all user sessions
- Automatic quantity adjustments upon checkout
- Instant visibility of supply availability
- Prevents over-distribution of limited items

[↑ Jump to top](#table-of-contents)

### 2. **Searchable Supply Database**
- Quick search functionality across all supply items
- Filter by category, item name, or availability
- Comprehensive supply catalog with detailed information
- Easy identification of needed items

[↑ Jump to top](#table-of-contents)

### 3. **Shopping Cart System**
- **Add to Cart**: Select items for checkout
- **Conditional Cart Display**: Cart appears only when items are selected
- **Quantity Management**: Adjust quantities before checkout
- **Session-Based**: Individual carts per user session

[↑ Jump to top](#table-of-contents)

### 4. **Checkout Process**
- **Confirm Checkout**: Final confirmation before inventory update
- **Automatic Inventory Adjustment**: Real-time quantity reduction
- **Transaction Recording**: Track who checked out what items
- **Clear Cart**: Reset cart after successful checkout

[↑ Jump to top](#table-of-contents)

### 5. **User Session Management**
- **Individual Cart Sessions**: Each staff member has their own cart
- **Session Isolation**: Staff cannot see other users' pending selections
- **User-Specific Tracking**: Personal checkout history and preferences
- **Concurrent Access**: Multiple staff can use system simultaneously

[↑ Jump to top](#table-of-contents)

## User Interface Components

### Supply Display
Each supply item includes:
- **Item Name**: Primary identifier for supply
- **Category**: Classification of supply type
- **Current Inventory**: Real-time quantity available
- **Item Description**: Detailed information about the supply
- **Location**: Storage location within facility
- **Add to Cart Button**: Selection control for checkout

[↑ Jump to top](#table-of-contents)

### Cart Interface
The shopping cart displays:
- **Selected Items**: List of items ready for checkout
- **Quantities**: Number of each item to be checked out
- **Inventory Impact**: Shows remaining quantities after checkout
- **Remove Items**: Option to remove items from cart
- **Checkout Button**: Confirm and process distribution

[↑ Jump to top](#table-of-contents)

### Action Controls
- **Search Bar**: Find specific supplies quickly
- **Add to Cart**: Select items for distribution
- **Quantity Adjustment**: Modify checkout quantities
- **Remove from Cart**: Remove unwanted items
- **Checkout**: Complete the distribution process

[↑ Jump to top](#table-of-contents)

## Benefits for Staff

### Inventory Management
- **Real-Time Accuracy**: Always current inventory levels
- **Prevent Shortages**: Avoid over-distribution of limited supplies
- **Efficient Distribution**: Quick identification of available items
- **Automated Tracking**: Automatic inventory updates upon checkout

[↑ Jump to top](#table-of-contents)

### Client Service Enhancement
- **Faster Service**: Quick supply lookup and distribution
- **Accurate Information**: Real-time availability prevents disappointment
- **Comprehensive Options**: Complete supply catalog visibility
- **Immediate Access**: No waiting for inventory checks

[↑ Jump to top](#table-of-contents)

### Administrative Efficiency
- **Reduced Manual Tracking**: Automated inventory management
- **User Accountability**: Track who distributed what supplies
- **Simplified Process**: Streamlined checkout workflow
- **Error Prevention**: System prevents negative inventory levels

[↑ Jump to top](#table-of-contents)

## AppSheet Configuration

### View Configuration

#### View Settings
- **View Name**: Supplies
- **View Type**: Gallery view with inventory display
- **Data Source**: Supplies Inventory table
- **Position**: Primary navigation position

#### Display Options
- **Primary Header**: Item Name
- **Secondary Header**: Category
- **Summary Column**: Current Inventory (with quantity display)
- **Search Configuration**: Enabled across item names and categories

#### Sorting and Grouping
- **Sort by**: Item Name (Ascending)
- **Group by**: 
  - Category (Ascending)
  - Item Name (Ascending)
- **Group aggregate**: SUM of Current Inventory

#### Action Bar Configuration
- **Show action bar**: Enabled
- **Actions**: Manual selection with the following options:
  - **Add to Cart**: Adds item to user's checkout cart
  - **View Details**: Display full item information
  - **Check Inventory**: Real-time inventory status

[↑ Jump to top](#table-of-contents)

### Cart System Implementation

#### Cart Table Structure
- **CartID**: Unique identifier for each cart entry
- **UserEmail**: Links cart to specific user session
- **ItemID**: References supply item
- **Quantity**: Number of items in cart
- **DateAdded**: Timestamp of cart addition

#### Add to Cart Action
- **Function**: Adds new row to Supplies Cart table
- **Referenced Data**: ItemID of selected supply
- **User Assignment**: Automatically uses USEREMAIL() function
- **Quantity Default**: 1 (adjustable in cart view)

#### Cart Display Logic
- **Conditional Visibility**: `COUNT(FILTER("Supplies Cart", [UserEmail] = USEREMAIL())) > 0`
- **User-Specific**: Shows only current user's cart items
- **Real-Time Updates**: Reflects changes immediately

[↑ Jump to top](#table-of-contents)

### Inventory Tracking System

#### Checkout Process
- **Inventory Validation**: Checks available quantity before checkout
- **Automatic Deduction**: Reduces inventory by cart quantities
- **Transaction Log**: Records checkout details and user information
- **Cart Clearing**: Removes items from cart after successful checkout

#### Real-Time Updates
- **Concurrent Access**: Multiple users see same inventory levels
- **Immediate Refresh**: Inventory updates instantly across all sessions
- **Availability Checks**: Prevents checkout of unavailable items

[↑ Jump to top](#table-of-contents)

### Technical Implementation Notes
- **User Authentication**: USEREMAIL() function for session management
- **Session Isolation**: User-specific cart functionality
- **Referential Integrity**: Proper linking between Supplies and Cart tables
- **Data Validation**: Prevents negative inventory levels
- **Concurrent Processing**: Handles multiple simultaneous users

[↑ Jump to top](#table-of-contents)

## Best Practices

### For Staff Usage
1. **Cart Management**: Review cart contents before checkout
2. **Quantity Accuracy**: Ensure correct quantities are selected
3. **Immediate Checkout**: Complete checkout promptly to free up inventory
4. **Search Utilization**: Use search function for quick item location

[↑ Jump to top](#table-of-contents)

### For Inventory Management
1. **Regular Restocking**: Monitor inventory levels for reorder needs
2. **Accurate Counts**: Ensure physical inventory matches system records
3. **Category Organization**: Maintain clear categorization for easy searching
4. **Usage Monitoring**: Track distribution patterns for better planning

[↑ Jump to top](#table-of-contents)